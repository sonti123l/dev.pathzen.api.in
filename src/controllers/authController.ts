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

    let responseResult;
    let statusCodeForNoData;
    let statusCodeMessageForData;
    let userJsonData;
    let dataVariables;
    userJsonData = userSchema.safeParse({ email, password });

    if (!userJsonData?.success) {
      dataVariables = userJsonData?.error?.issues?.map(
        (eachError) => eachError?.message,
      );
      statusCodeForNoData = StatusCodes.UNPROCESSABLE_ENTITY;
      statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
      responseResult = createDataSchemaAndReturnIt({
        status: statusCodeForNoData,
        message: statusCodeMessageForData,
        success: false,
        data: dataVariables,
      });
    }

    return responseResult;
  }
}

export const authController = new AuthController();
