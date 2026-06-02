import express from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/users.model.js";
import { urlsTable } from "../models/url.model.js";

export async function getUserByEmail(email) {
  try {
    const [existingUser] = await db
      .select({
        id: usersTable.id,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
        password: usersTable.password,
        salt: usersTable.salt,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return existingUser;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(firstname, lastname, email, password, salt) {
  try {
    const [user] = await db
      .insert(usersTable)
      .values({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        salt: salt,
      })
      .returning({
        userId: usersTable.id,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
      });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function createShortUrl(url, code, userId) {
  try {
    // Check if the generated short code already exists in the database
    const [result] = await db
      .insert(urlsTable)
      .values({
        code: code,
        targetUrl: url,
        userId: userId,
      })
      .returning({
        id: urlsTable.id,
        code: urlsTable.code,
        targetUrl: urlsTable.targetUrl,
      });

    return result;
  } catch (error) {
    console.error("Error creating short URL:", error);
    throw new Error("Failed to create short URL");
  }
}
