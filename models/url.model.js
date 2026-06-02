import {
  uuid,
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),
  code: varchar("code", { length: 155 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});
