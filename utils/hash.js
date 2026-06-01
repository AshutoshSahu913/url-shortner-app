import { randomBytes, createHmac } from "crypto";

export function hashPasswordWithSalt(password, userSalt = undefined) {
  const salt = userSalt ?? randomBytes(256).toString("hex");
  const hashPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");
  return { salt, password: hashPassword };
}
