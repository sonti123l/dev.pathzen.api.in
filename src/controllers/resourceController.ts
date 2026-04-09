import type { queryParams } from "../@types/interfaces/queryParams.js";
import { db } from "../db/db.js";
import { colleges } from "../db/schema/colleges.js";
import { count } from "drizzle-orm";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { collegeListSchema } from "../zod/collegesListSchema.js";

class resourceController {
  async getColleges({ page, limit }: queryParams) {
    const getTotalRecords = await db.select({ value: count() }).from(colleges);
    let statusCode;
    let statusCodeMessage;
    let paginationData;
    let result;
    const total_records = getTotalRecords;
    const total_pages = Math.ceil(total_records[0]?.value / limit);
    const getDataFromColleges = await db
      .select()
      .from(colleges)
      .limit(limit)
      .offset(page);
    if (getDataFromColleges) {
      statusCode = StatusCodes.OK;
      statusCodeMessage = getStatusMessage(statusCode);
      paginationData = collegeListSchema.safeParse({
        page: page,
        total_records: total_records[0]?.value,
        total_pages: total_pages,
        limit: limit,
      });
      result = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: true,
        data: {
          pagination: paginationData?.data,
          data: getDataFromColleges,
        },
      });
    }

    return result;
  }
}

export const resController = new resourceController();
