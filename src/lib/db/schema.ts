import {
  boolean,
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
  verified: boolean("verified").notNull().default(false),
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

export const emailVerificationRequests = createTable(
  "email_verification_request",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
);

export type EmailVerificationRequest =
  typeof emailVerificationRequests.$inferSelect;

export const rooms = createTable("rooms", {
  id: varchar("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
});

export const passwordResetSession = createTable("password_reset_session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorVerified: boolean("two_factor_verified").notNull().default(false),
});

export const editAccess = createTable("edit_access", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => users.id),
  roomIdRequestedFor: varchar("room_id_requested_for")
    .notNull()
    .references(() => rooms.id),
  status: editAccessStatusEnum("edit_access_status").notNull(),
});
