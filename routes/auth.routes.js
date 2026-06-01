import express from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/users.model.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail, createUser } from "../services/user.services.js";
import jwt from "jsonwebtoken";
import {
  registerSchema,
  loginSchema,
} from "../validation/request.validation.js";

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
    const validationResult = await registerSchema.safeParseAsync(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    const { firstname, lastname, email, password } = validationResult.data;
      

    //check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    //hash password
    const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

    const user = await createUser(
      firstname,
      lastname,
      email,
      hashedPassword,
      salt,
    );

    console.log("User registered successfully:", user);

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
    // Validate the incoming request body against the login schema
    const validationResult = await loginSchema.safeParseAsync(req.body);

    // If validation fails, return a 400 Bad Request response with error details
    if (validationResult.error) {
      return res.status(400).json({
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    // Extract email and password from the validated data
    const { email, password } = validationResult.data;

    // check if user exists
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }
    //
    const { password: hashPassword } = hashPasswordWithSalt(
      password,
      existingUser.salt,
    );

    if (hashPassword !== existingUser.password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate a JWT token for the authenticated user
    const payload = {
      userId: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstname,
    };

    // Sign the JWT token with a secret key and set an expiration time
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
