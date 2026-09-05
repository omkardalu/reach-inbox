import { defineConfig } from "drizzle-kit";

// drizzle-kit uses a standard pg TCP connection for introspection.
// Strip channel_binding from the URL so it can connect directly.
const rawUrl = process.env.DATABASE_URL ?? "";
const kitUrl = rawUrl.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: kitUrl,
  },
});
