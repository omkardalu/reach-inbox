import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const emails = pgTable("emails", {
  id:          text("id").primaryKey(),
  userEmail:   text("user_email").notNull(),
  refCode:     text("ref_code").notNull(),
  toAddress:   text("to_address").notNull(),
  fromName:    text("from_name").notNull(),
  fromEmail:   text("from_email").notNull(),
  subject:     text("subject").notNull().default(""),
  body:        text("body").notNull().default(""),
  preview:     text("preview").notNull().default(""),
  status:      text("status").notNull(),       // "Sent" | "Scheduled"
  statusTime:  text("status_time"),            // formatted schedule label
  sendAt:      timestamp("send_at"),           // null = sent immediately
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export type EmailRow = typeof emails.$inferSelect;
