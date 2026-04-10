import type { queryParams } from "../@types/interfaces/queryParams.js";
import { db } from "../db/db.js";
import { colleges } from "../db/schema/colleges.js";
import { count } from "drizzle-orm";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { collegeListSchema } from "../zod/collegesListSchema.js";
import { domains } from "../db/schema/course_domain.js";
import { domainSchema } from "../zod/domainSchema.js";
import { courses } from "../db/schema/courses.js";
import { eq } from "drizzle-orm";

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

  async getDomain({ page, limit }: queryParams) {
    const getTotalRecords = await db.select({ value: count() }).from(domains);
    let statusCode;
    let statusCodeMessage;
    let paginationData;
    let result;
    const total_records = getTotalRecords;
    const total_pages = Math.ceil(total_records[0]?.value / limit);
    const getDomainsData = await db
      .select()
      .from(domains)
      .limit(limit)
      .offset(page);
    if (getDomainsData) {
      statusCode = StatusCodes.OK;
      statusCodeMessage = getStatusMessage(statusCode);
      paginationData = domainSchema.safeParse({
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
          data: getDomainsData,
        },
      });
    }

    return result;
  }

  async getCoursesAccordingToId(domainId: number) {
    const getCoursesAccordingToDomainId = await db
      .select()
      .from(courses)
      .where(eq(courses.field_id, domainId));
    let statusCode;
    let statusCodeMessage;
    let result;

    if (getCoursesAccordingToDomainId) {
      statusCode = StatusCodes.OK;
      statusCodeMessage = getStatusMessage(statusCode);

      result = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: true,
        data: {
          data: getCoursesAccordingToDomainId,
        },
      });
    }

    return result;
  }
}

export const resController = new resourceController();
