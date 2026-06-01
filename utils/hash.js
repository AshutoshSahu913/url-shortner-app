import { randomBytes, createHmac } from "crypto";

export function hashPasswordWithSalt(password) {
  const salt = randomBytes(256).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return { salt, hash };
}
