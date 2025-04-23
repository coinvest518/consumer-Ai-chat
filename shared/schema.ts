import { pgTable, text, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  dailyQuestionsRemaining: integer("daily_questions_remaining").default(5).notNull(),
  lastResetDate: timestamp("last_reset_date").defaultNow().notNull(),
  supabaseId: text("supabase_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat session table
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat message table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: serial("session_id").references(() => chatSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing citations, actions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isPro: true,
  supabaseId: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  title: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  type: true,
  content: true,
  metadata: true,
});

// Message schema for API requests
export const messageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type MessageRequest = z.infer<typeof messageSchema>;
