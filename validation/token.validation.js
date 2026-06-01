import {z} from "zod";

export const tokenValidationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  email: z.string().email("Invalid email address"),
  firstname: z.string().min(3, "First name must be at least 3 characters long"),
});