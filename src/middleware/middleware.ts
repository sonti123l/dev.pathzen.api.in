import { verify } from "hono/jwt";
import "dotenv/config";

const checkAuthorization = async (authorizationKey: string) => {
  const verifyUser = await verify(
    authorizationKey,
    `${process.env.JWT_ACCESS_SECRET_KEY}`,
    "ES256",
  );
  return verifyUser;
};

export default checkAuthorization;
