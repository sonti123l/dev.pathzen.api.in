import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import userSchema from "../zod/userSchema.js";
import "dotenv/config";
import { sign } from "hono/jwt";
import { parseDuration } from "../utils/jwt.js";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;

class AuthController {
  async getUserLoginCredentials<T, V>({
    email,
    password,
  }: {
    email: T;
    password: V;
  }) {
    let responseResult;
    let statusCodeForNoData;
    let statusCodeMessageForData;
    let userJsonData;
    let dataVariables;
    userJsonData = userSchema.safeParse({ email, password });
    const now = Math.floor(Date.now() / 1000);

    if (!userJsonData?.success) {
      dataVariables = userJsonData?.error?.issues?.map((eachError) => ({
        path: eachError.path,
        message: eachError?.message,
      }));
      statusCodeForNoData = StatusCodes.UNPROCESSABLE_ENTITY;
      statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
      responseResult = createDataSchemaAndReturnIt({
        status: statusCodeForNoData,
        message: statusCodeMessageForData,
        success: false,
        data: dataVariables,
      });
      return responseResult;
    }

    const token = async () => {
      const payload = {
        userEmail: email,
        userPassword: password,
      };
      const access_token = await sign(
        {
          userId: 1,
          payload: payload,
          exp: now + parseDuration(process.env.JWT_ACCESS_EXPIRES_IN),
        },
        SECRET_KEY ?? "",
      );

      const refresh_token = await sign(
        {
          userId: 1,
          payload: payload,
          exp: now + parseDuration(process.env.JWT_REFRESH_EXPIRES_IN),
        },
        process.env.JWT_REFRESH_SECRET_KEY ?? "",
      );

      return { access_token: access_token, refresh_token: refresh_token };
    };

    const tokens = await token();
    dataVariables = {
      email: email,
    };

    statusCodeForNoData = StatusCodes.OK;
    statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
    responseResult = createDataSchemaAndReturnIt({
      status: statusCodeForNoData,
      message: statusCodeMessageForData,
      success: true,
      token: tokens,
      data: dataVariables,
    });
    
    return responseResult;
  }
}

export const authController = new AuthController();
