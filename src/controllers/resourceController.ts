import type { queryParams } from "../@types/interfaces/queryParams.js";
import { db } from "../db/db.js";
import { colleges } from "../db/schema/colleges.js";
import { count, like } from "drizzle-orm";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { domains } from "../db/schema/course_domain.js";
import { domainSchema } from "../zod/domainSchema.js";
import { courses } from "../db/schema/courses.js";
import { eq } from "drizzle-orm";
import { modules } from "../db/schema/module.js";
import { subModules } from "../db/schema/subModules.js";
import { arrangeData } from "../helpers/courseDataStructuring.js";

class resourceController {
  async getColleges({ page, limit, search }: queryParams) {
    const offset = (page - 1) * limit;

    const cleanSearch = search?.trim();

    const whereCondition =
      cleanSearch && cleanSearch.length > 0
        ? like(colleges.college_name, `%${cleanSearch}%`)
        : "";

    let getDataFromColleges;
    let totalResult;

    if (whereCondition) {
      getDataFromColleges = await db
        .select()
        .from(colleges)
        .where(whereCondition)
        .limit(limit)
        .offset(offset);

      totalResult = await db
        .select({ value: count() })
        .from(colleges)
        .where(whereCondition);
    } else {
      getDataFromColleges = await db
        .select()
        .from(colleges)
        .limit(limit)
        .offset(offset);

      totalResult = await db.select({ value: count() }).from(colleges);
    }

    const total_records = totalResult[0]?.value || 0;
    const total_pages = Math.ceil(total_records / limit);

    return createDataSchemaAndReturnIt({
      status: StatusCodes.OK,
      message: getStatusMessage(StatusCodes.OK),
      success: true,
      data: {
        pagination: {
          page,
          total_records,
          total_pages,
          limit,
        },
        data: getDataFromColleges,
      },
    });
  }

  async getDomain({ page, limit }: { page: number; limit: number }) {
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

  async getCourseDetailsByCourseId(course_id: number) {
    const getCourseDetails = await db
      .select()
      .from(courses)
      .where(eq(courses.course_id, course_id));
    let statusCode;
    let statusCodeMessage;
    let result;

    const getModulesData = await db
      .select({
        module_id: modules.module_id,
        module_name: modules.module_name,
        course_id_for_module: modules.course_id_for_module,
        is_module_complete: modules.is_module_complete,
        sub_module_id: subModules.sub_module_id,
        sub_module_title: subModules.sub_module_title,
        is_sub_module_completed: subModules.is_sub_module_completed,
        sub_module_in_module_id: subModules.sub_module_in_module_id,
        is_active: subModules.is_active,
      })
      .from(modules)
      .leftJoin(
        subModules,
        eq(modules.module_id, subModules.sub_module_in_module_id),
      )
      .where(eq(modules.course_id_for_module, course_id));

    if (getCourseDetails?.length > 0) {
      const getDomainDetails = getCourseDetails[0]?.field_id
        ? await db
            .select()
            .from(domains)
            .where(eq(domains.domain_id, getCourseDetails?.[0].field_id))
        : {};
      if (getDomainDetails) {
        if (getModulesData?.length > 0) {
          const getModuleEntireFormattedData =
            await arrangeData(getModulesData);
          statusCode = StatusCodes.OK;
          statusCodeMessage = getStatusMessage(statusCode);

          result = createDataSchemaAndReturnIt({
            status: statusCode,
            message: statusCodeMessage,
            success: true,
            data: {
              data: {
                domain: getDomainDetails,
                course: getCourseDetails,
                modules: getModuleEntireFormattedData,
              },
            },
          });
        }
      }
      return result;
    }
  }

  async getAllCourses() {
    const getCourseAndDomainDetails = await db
      .select({
        domain_id: domains.domain_id,
        domain_name: domains.domain_name,
        course_id: courses.course_id,
        course_name: courses.course_name,
        course_meta_data: courses.course_meta_data,
        course_created_at: courses.course_created_at,
      })
      .from(courses)
      .leftJoin(domains, eq(domains.domain_id, courses.field_id));

    let statusCode;
    let statusCodeMessage;
    let result;

    if (getCourseAndDomainDetails?.length > 0) {
      statusCode = StatusCodes.OK;
      statusCodeMessage = getStatusMessage(statusCode);

      result = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: true,
        data: getCourseAndDomainDetails,
      });
    }

    return result;
  }
}

export const resController = new resourceController();
