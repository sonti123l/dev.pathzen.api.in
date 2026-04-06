import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import createDataSchemaAndReturnIt from "../schema/dataSchema.js";
import userSchema from "../schema/userSchema.js";

class AuthController {
  getUserLoginCredentials<T, V>({
    email,
    password,
  }: {
    email: T;
    password: V;
  }) {
    const emailRegex = /^[a-zA-Z0-`9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !password) {
      const statusCodeForNoData = StatusCodes.UNPROCESSABLE_ENTITY;
      const statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
      const userJsonData = userSchema.parse({ email, password });
      const responseResult = createDataSchemaAndReturnIt({
        status: statusCodeForNoData,
        message: statusCodeMessageForData,
        error: false,
        schema: JSON.stringify(userJsonData),
      });

      return responseResult
    }
  }
}

export const authController = new AuthController();

