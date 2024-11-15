import {
  integer,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator(
  (name: string): string => `figma_${name}`,
);

export const editAccessStatusEnum = pgEnum("edit_access_status", [
  "pending",
  "accepted",
  "declined",
]);

export const users = createTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  number: varchar("number").unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = createTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const rooms = createTable("rooms", {
  id: varchar("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
});

export const editAccess = createTable("editAccess", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => users.id),
  roomIdRequestedFor: varchar("room_id_requested_for")
    .notNull()
    .references(() => rooms.id),
  status: editAccessStatusEnum("edit_access_status").notNull(),
});
