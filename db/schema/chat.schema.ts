import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, timestamp, json } from "drizzle-orm/pg-core";

import { user } from "./user.schema";

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
}; 