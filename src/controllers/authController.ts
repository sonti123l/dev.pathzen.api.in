import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import userSchema from "../zod/userSchema.js";
import "dotenv/config";
import { db } from "../db/db.js";
import { students } from "../db/schema/students.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { users } from "../db/schema/users.js";
import type {
  TokenType,
  UserRegisterForm,
} from "../@types/interfaces/queryParams.js";
import { userRegisterFormSchema } from "../zod/userRegisterFormSchema.js";
import { token } from "../helpers/token.js";

const hashingPassword = 10;

class AuthController {
  async getUserLoginCredentials<T extends string, V extends string>({
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
    let tokens: TokenType = {
      access_token: "",
      refresh_token: "",
    };
    let checkUserInDb;

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

    checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, email));

    const hashedPassword = await bcrypt.compare(
      `${password}`,
      checkUserInDb[0]?.user_password,
    );

    if (!hashedPassword) {
      statusCodeForNoData = StatusCodes.UNAUTHORIZED;
      statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
      responseResult = createDataSchemaAndReturnIt({
        status: statusCodeForNoData,
        message: "Authentication is required. Invalid credentials",
        success: false,
        data: {
          password: "Invalid Email or Password",
        },
      });

      return responseResult;
    }

    if (checkUserInDb.length > 0) {
      tokens = await token({
        email: email,
        password: password,
      });

      const insertRefreshToken = await db
        .update(users)
        .set({ refresh_token: tokens.refresh_token })
        .where(eq(users.user_id, checkUserInDb[0]?.user_id));
      dataVariables = {
        email: email,
      };

      if (insertRefreshToken) {
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
  }

  async registerNewUser({
    name,
    email,
    password,
    branchName,
    collegeId,
    domainId,
    rollNo,
    courseId,
  }: UserRegisterForm) {
    const hashedPassword = await bcrypt.hash(`${password}`, hashingPassword);
    let sendingStatusCodes;
    let sendingMessageForUser;
    let responseResult;
    let dataVariables;
    let studentCollegeId;
    const checkUserInDb = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, email),
          eq(users.user_password, hashedPassword),
        ),
      );

    console.log("checking while registration ", checkUserInDb);
    if (checkUserInDb.length > 0) {
      sendingStatusCodes = StatusCodes.CONFLICT;
      sendingMessageForUser = getStatusMessage(sendingStatusCodes);
      responseResult = createDataSchemaAndReturnIt({
        status: sendingStatusCodes,
        message: sendingMessageForUser,
        success: false,
        data: {
          error: "User already exists.",
        },
      });
      return responseResult;
    } else {
      const checkUserSchema = userRegisterFormSchema.safeParse({
        name: name,
        email: email,
        password: password,
        branch_name: branchName,
        college_id: collegeId,
        domain_id: domainId,
        roll_no: rollNo,
        course_id: courseId,
      });

      if (!checkUserSchema?.success) {
        dataVariables = checkUserSchema?.error?.issues?.map((eachError) => ({
          path: eachError.path,
          message: eachError?.message,
        }));
        sendingStatusCodes = StatusCodes.UNPROCESSABLE_ENTITY;
        sendingMessageForUser = getStatusMessage(sendingStatusCodes);
        responseResult = createDataSchemaAndReturnIt({
          status: sendingStatusCodes,
          message: sendingMessageForUser,
          success: false,
          data: dataVariables,
        });
        return responseResult;
      }

      const insertUser = await db
        .insert(users)
        .values({
          user_email: email,
          user_password: hashedPassword,
        })
        .$returningId();

      studentCollegeId = rollNo.match(/\d+(\.\d+)?/g);
      const insertStudent = await db.insert(students).values({
        student_name: name,
        student_email_id: `${email}`,
        student_password: hashedPassword,
        branch_name: branchName,
        is_user: "STUDENT",
        student_roll_no: Number(
          String(studentCollegeId?.[0]) +
            String(studentCollegeId?.[1]) +
            studentCollegeId?.[2],
        ),
        student_college_id: collegeId,
        student_id: insertUser[0]?.user_id,
        student_course_id: courseId,
      });

      if (insertStudent) {
        sendingStatusCodes = StatusCodes.OK;
        sendingMessageForUser = getStatusMessage(sendingStatusCodes);
        responseResult = createDataSchemaAndReturnIt({
          status: sendingStatusCodes,
          message: sendingMessageForUser,
          success: true,
          data: {
            success_message: "User registered successfully",
          },
        });
        return responseResult;
      }
    }
  }
}

export const authController = new AuthController();
