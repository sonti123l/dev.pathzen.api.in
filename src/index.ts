import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/authRouter.js";
import { jwt } from "hono/jwt";
import "dotenv/config";
import { resourceRouter } from "./routes/resourceRouter.js";
import appRouter from "./routes/appRouter.js";
import roomRouter from "./routes/roomRouter.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("path zen is running");
});

app.use("*", cors());

app.route("/auth", authRouter);

app.route("/api", resourceRouter);

app.route("/course", appRouter);

app.route("/rooms", roomRouter);

app.use(
  "/auth/*",
  jwt({
    secret: `${process.env.JWT_ACCESS_SECRET_KEY}`,
    alg: "ES256",
  }),
);

app.get("/test-env", (c) => {
  return c.json({
    cloudflare_account_id: process.env.CLOUDFLARE_ACCOUNT_ID ? "exists" : "missing",
    cloudflare_api_token: process.env.CLOUDFLARE_API_TOKEN ? "exists" : "missing",
  })
})

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
    hostname: '0.0.0.0'
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
