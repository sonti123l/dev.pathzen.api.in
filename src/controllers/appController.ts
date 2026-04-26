import { db } from "../db/db.js";
import { subModules } from "../db/schema/subModules.js";
import { eq } from "drizzle-orm";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";

class AppController {
  async updateSubmoduleData({
    id,
    live_time,
  }: {
    id: number;
    live_time: string;
  }) {
    const getSubModuleData = await db
      .select()
      .from(subModules)
      .where(eq(subModules.sub_module_id, id));

    let statusCode;
    let statusCodeMessage;
    let responseResult;

    if (getSubModuleData?.length > 0) {
      const updateRecord = await db
        .update(subModules)
        .set({ live_time: live_time })
        .where(eq(subModules?.sub_module_id, id));
      if (updateRecord.length > 0) {
        statusCode = StatusCodes.OK;
        statusCodeMessage = getStatusMessage(statusCode);

        responseResult = createDataSchemaAndReturnIt({
          status: statusCode,
          message: statusCodeMessage,
          success: true,
          data: {
            message: "Successfully scheduled meeting",
          },
        });

        return responseResult;
      }
    }
  }
}

export const appController = new AppController();
