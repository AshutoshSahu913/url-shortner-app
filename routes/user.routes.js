import express from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/users.model.js";
import { randomBytes, createHmac } from "crypto";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("Users API is available");
  res.json({
    message: "Users API is available",
    endpoints: ["POST /api/users/register"],
  });
});

//register route
router.post("/register", async (req, res) => {
  try {
    console.log("Registering user with data:", req.body);
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      if (!first_name)
        return res.status(400).json({ error: "First name is required" });
      if (!last_name)
        return res.status(400).json({ error: "Last name is required" });
      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!password)
        return res.status(400).json({ error: "Password is required" });
    }
    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    if (!email.includes("@") || !email.includes("."))
      return res.status(400).json({ error: "Invalid email address" });

    if (first_name.length < 3 || last_name.length < 3)
      return res
        .status(400)
        .json({ error: "Name must be at least 3 characters long" });

    //check if user already exists
    const existingUsers = await db
      .select({
        id: usersTable.id,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUsers.length > 0)
      return res.status(400).json({ error: "User already exists" });

    //hash password
    const salt = randomBytes(256).toString("hex");

    //hash password using sha256 and salt
    const hashPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    const [user] = await db
      .insert(usersTable)
      .values({
        firstname: first_name,
        lastname: last_name,
        email,
        password: hashPassword,
        salt,
      })
      .returning({
        userId: usersTable.id,
      });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.userId,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!password)
        return res.status(400).json({ error: "Password is required" });
    }

    // check if user exists
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!existingUser) {
      res.status(400).json({ error: "User does not exist" });
    }
    //hash password using sha256 and salt
    const salt = existingUser.salt;
    
    //
    const hashPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashPassword !== existingUser.password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const payload = {
      userId: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstname,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: "success",
      token,
      data: {
        userId: existingUser.id,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
