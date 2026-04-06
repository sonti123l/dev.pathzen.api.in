import { Hono } from "hono";
import { authController } from "../controllers/authController.js";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const authRouter = new Hono();

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const result = authController.getUserLoginCredentials<string, string>({
    email,
    password,
  });

  console.log(typeof result);
  return c.json(result, result?.status as ContentfulStatusCode);
});

export { authRouter };
