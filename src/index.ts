import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/authRouter.js";
import "dotenv/config";
import { resourceRouter } from "./routes/resourceRouter.js";
import appRouter from "./routes/appRouter.js";
import roomRouter from "./routes/roomRouter.js";
import checkAuthorization from "./middleware/middleware.js";
import notifications from "./routes/notifications.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("path zen is running");
});

app.use("*", cors());

app.route("/auth", authRouter);
app.route("/api", resourceRouter);

app.route("/api/notifications", notifications);

app.use("/course/*", checkAuthorization);
app.use("/rooms/*", checkAuthorization);

app.route("/course", appRouter);
app.route("/rooms", roomRouter);

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
