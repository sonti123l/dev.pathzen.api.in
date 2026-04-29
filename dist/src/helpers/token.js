import { sign } from "hono/jwt";
import { parseDuration } from "../utils/jwt.js";
import "dotenv/config";
const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
export const token = async ({ email, password, }) => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        userEmail: email,
        userPassword: password,
    };
    const access_token = await sign({
        userId: 1,
        payload: payload,
        exp: now + parseDuration(process.env.JWT_ACCESS_EXPIRES_IN),
    }, SECRET_KEY ?? "");
    const refresh_token = await sign({
        userId: 1,
        payload: payload,
        exp: now + parseDuration(process.env.JWT_REFRESH_EXPIRES_IN),
    }, process.env.JWT_REFRESH_SECRET_KEY ?? "");
    return { access_token: access_token, refresh_token: refresh_token };
};
