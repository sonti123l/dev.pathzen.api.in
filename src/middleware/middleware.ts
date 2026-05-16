import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import "dotenv/config";

const checkAuthorization = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        status: 401,
        success: false,
        message: "Unauthorized",
        data: { error: "Missing or invalid Authorization header. Expected: Bearer <token>" },
      },
      401,
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const verifiedPayload = await verify(
      token,
      `${process.env.JWT_ACCESS_SECRET_KEY}`,
      "HS256",
    );
    // Attach decoded user to context so route handlers can access it
    c.set("user", verifiedPayload);
    await next();
  } catch {
    return c.json(
      {
        status: 401,
        success: false,
        message: "Unauthorized",
        data: { error: "Invalid or expired token. Please log in again." },
      },
      401,
    );
  }
};

export default checkAuthorization;
