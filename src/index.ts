import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/authRouter.js";
import { jwt } from "hono/jwt";
import "dotenv/config";

const app = new Hono();

app.get("/", (c) => {
  return c.text("path zen is running");
});

app.use("*", cors());

app.route("/auth", authRouter);

app.use(
  "/auth/*",
  jwt({
    secret: `${process.env.JWT_ACCESS_SECRET_KEY}`,
    alg: "ES256",
  }),
);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
