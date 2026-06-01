import jwt from "jsonwebtoken";
import { tokenValidationSchema } from "../validation/token.validation.js";

export async function generateToken(payload) {
  try {
    const validationResult = await tokenValidationSchema.safeParseAsync(payload);
    if (validationResult.error) {
      throw new Error("Invalid token payload: " + validationResult.error);
    }

    const validateDataPayload = validationResult.data;

    const token = jwt.sign(validateDataPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
}
