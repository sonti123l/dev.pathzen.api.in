import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { subModules } from "./subModules.js";

export const rooms = mysqlTable("rooms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  liveInputId: varchar("live_input_id", { length: 255 }),
  streamKey: varchar("stream_key", { length: 500 }),
  hlsUrl: varchar("hls_url", { length: 500 }),
  iframeUrl: varchar("iframe_url", {length:500}),
  recordingUrl: varchar("recording_url", { length: 500 }),
  status: varchar("status", { length: 20 }).default("waiting"),
  // 'waiting' → teacher set time but not live yet
  // 'live'    → teacher clicked go live
  // 'ended'   → class finished
  isRecordingPosted: boolean("is_recording_posted").default(false),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  subModuleId: int("sub_module_id")
    .references(() => subModules.sub_module_id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});
