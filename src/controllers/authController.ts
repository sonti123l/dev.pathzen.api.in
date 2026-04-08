import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import userSchema from "../zod/userSchema.js";
import "dotenv/config";
import { sign } from "hono/jwt";
import { parseDuration } from "../utils/jwt.js";
import { db } from "../db/db.js";
import { students } from "../db/schema/students.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { users } from "../db/schema/users.js";
import { colleges } from "../db/schema/colleges.js";
import { courses } from "../db/schema/courses.js";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
const hashingPassword = 10;

interface TokenType {
  access_token: string;
  refresh_token: string;
}

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
    let tokens: TokenType = {
      access_token: "",
      refresh_token: "",
    };
    let checkUserInDb;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

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
    } else {
      checkUserInDb = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.student_email_id, `${email}`),
            eq(students.student_password, `${password}`),
          ),
        );
      if (checkUserInDb.length === 0) {
        const hashedPassword = await bcrypt.hash(
          `${password}`,
          hashingPassword,
        );
        tokens = await token();

        const insertNewUserFirstIntoUsersTable = await db
          .insert(users)
          .values({
            refresh_token: tokens.refresh_token,
          })
          .$returningId();

        const insertingTheUsersCollegeDetails = await db
          .insert(colleges)
          .values({
            college_address:
              "Seshadri Rao Knowledge Village, Gudlavalleru, Krishna District, Andhra Pradesh, 521356, India",
            college_name: "Seshadri Rao Gudlavalleru engineering college",
          })
          .$returningId();

        const insertingTheUsersCourseDetails = await db
          .insert(courses)
          .values({
            course_name: "Full Stack Web Development Course 2026",
            course_meta_data: {
              course_modules: 18,
              course_schedule_date: "08-04-26",
            },
          })
          .$returningId();

        const insertUser = await db.insert(students).values({
          student_name: "sai trishal",
          student_email_id: `${email}`,
          student_password: hashedPassword,
          branch_name: "Computer Science and Engineering",
          student_college_id: insertingTheUsersCollegeDetails[0].college_id,
          student_id: insertNewUserFirstIntoUsersTable[0]?.user_id,
          student_course_id: insertingTheUsersCourseDetails[0]?.course_id,
        });

        checkUserInDb = await db
          .select()
          .from(students)
          .where(
            and(
              eq(students.student_email_id, `${email}`),
              eq(students.student_password, `${password}`),
            ),
          );
      }
    }

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
