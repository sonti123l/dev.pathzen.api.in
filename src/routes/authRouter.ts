import { Hono } from "hono";
import { authController } from "../controllers/authController.js";

const authRouter = new Hono();

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const result = authController.getUserLoginCredentials<string, string>({
    email,
    password,
  });

  console.log(result);
  return c.json(JSON.stringify(result, null, 2));
});

export { authRouter };
