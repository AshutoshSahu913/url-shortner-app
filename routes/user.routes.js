import express from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/users.model.js";
import { randomBytes, createHmac } from "crypto";
import jwt from "jsonwebtoken";
import { adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", adminMiddleware, async (req, res) => {
  console.log("Users API is available");
  
  const users = await db
    .select({
      id: usersTable.id,
      firstname: usersTable.firstname,
      lastname: usersTable.lastname,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable);

  console.log("Users:", users.length);
  res.status(200).json({
    status: "success",
    totalUsers: users.length,
    users: users,
  });
});

export default router;
