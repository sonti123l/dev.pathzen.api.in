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
import {
  teacherRegistrationSchema,
  userRegisterFormSchema,
} from "../zod/userRegisterFormSchema.js";
import { token } from "../helpers/token.js";
import { admin } from "../db/schema/admin.js";
import { teachers } from "../db/schema/teachers.js";

interface TeacherRegistration {
  fullName: string;
  emailAddress: string;
  password: string;
  assignedCourseId: number;
  experience: string;
  technicalSkills: {
    skills: string[];
  };
}
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
    let tokens: TokenType = {
      access_token: "",
      refresh_token: "",
    };
    let checkUserInDb;

    userJsonData = userSchema.safeParse({ email, password });

    if (!userJsonData?.success) {
      dataVariables = userJsonData?.error?.issues?.map((eachError) => ({
        key: eachError.path[0],
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
      if (checkUserInDb?.[0].role?.toUpperCase() === "STUDENT") {
        const getStudentFromDb = await db
          .select()
          .from(students)
          .where(eq(students.student_id, checkUserInDb[0]?.user_id));

        tokens = await token({
          email: email,
          password: password,
        });

        const insertRefreshToken = await db
          .update(users)
          .set({ refresh_token: tokens.refresh_token })
          .where(eq(users.user_id, checkUserInDb[0]?.user_id));

        const sendStudentData = {
          user_name: getStudentFromDb[0]?.student_name,
          user_mail: getStudentFromDb[0]?.student_email_id,
          branch_name: getStudentFromDb[0]?.branch_name,
          student_college_id: getStudentFromDb[0]?.student_college_id,
          student_roll_no: getStudentFromDb[0]?.student_roll_no,
          user_id: getStudentFromDb[0]?.student_id,
          user_course_id: getStudentFromDb[0]?.student_course_id,
          role: "STUDENT",
        };

        if (insertRefreshToken) {
          statusCodeForNoData = StatusCodes.OK;
          statusCodeMessageForData = getStatusMessage(statusCodeForNoData);

          responseResult = createDataSchemaAndReturnIt({
            status: statusCodeForNoData,
            message: statusCodeMessageForData,
            success: true,
            token: tokens,
            data: sendStudentData,
          });

          return responseResult;
        } else {
          statusCodeForNoData = StatusCodes.NOT_FOUND;
          statusCodeMessageForData = getStatusMessage(statusCodeForNoData);

          responseResult = createDataSchemaAndReturnIt({
            status: statusCodeForNoData,
            message: statusCodeMessageForData,
            success: false,
            data: {
              user: "User does not exist. Please register to proceed.",
            },
          });

          return responseResult;
        }
      } else if (checkUserInDb?.[0].role?.toUpperCase() === "ADMIN") {
        const getAdminFromDb = await db
          .select()
          .from(admin)
          .where(eq(admin.admin_user_id, checkUserInDb[0]?.user_id));

        tokens = await token({
          email: email,
          password: password,
        });

        const insertRefreshToken = await db
          .update(users)
          .set({ refresh_token: tokens.refresh_token })
          .where(eq(users.user_id, checkUserInDb[0]?.user_id));

        const adminData = {
          user_id: getAdminFromDb[0]?.admin_id,
          user_name: getAdminFromDb[0]?.admin_name,
          user_mail: getAdminFromDb[0]?.admin_mail,
          role: "ADMIN",
        };

        if (insertRefreshToken) {
          statusCodeForNoData = StatusCodes.OK;
          statusCodeMessageForData = getStatusMessage(statusCodeForNoData);

          responseResult = createDataSchemaAndReturnIt({
            status: statusCodeForNoData,
            message: statusCodeMessageForData,
            success: true,
            token: tokens,
            data: adminData,
          });

          return responseResult;
        }
      } else {
        const getTeacherDetails = await db
          .select()
          .from(teachers)
          .where(eq(teachers.teacher_user_id, checkUserInDb[0]?.user_id));

        if (getTeacherDetails?.length > 0) {
          tokens = await token({
            email: email,
            password: password,
          });

          const insertRefreshToken = await db
            .update(users)
            .set({ refresh_token: tokens.refresh_token })
            .where(eq(users.user_id, checkUserInDb[0]?.user_id));

          if (insertRefreshToken?.length > 0) {
            const teacherDataReturning = {
              user_id: getTeacherDetails[0]?.teacher_id,
              user_name: getTeacherDetails[0]?.teacher_name,
              user_mail: getTeacherDetails[0]?.teacher_email_id,
              user_course_id: getTeacherDetails[0]?.teacher_course_id,
              teacher_experience: getTeacherDetails[0]?.teacher_experience,
              teacher_technicalities:
                getTeacherDetails[0]?.teacher_technicalities,
              role: "TEACHER",
            };

            statusCodeForNoData = StatusCodes.OK;
            statusCodeMessageForData = getStatusMessage(statusCodeForNoData);

            responseResult = createDataSchemaAndReturnIt({
              status: statusCodeForNoData,
              message: statusCodeMessageForData,
              success: true,
              token: tokens,
              data: teacherDataReturning,
            });

            return responseResult;
          } else {
            statusCodeForNoData = StatusCodes.NOT_FOUND;
            statusCodeMessageForData = getStatusMessage(statusCodeForNoData);

            responseResult = createDataSchemaAndReturnIt({
              status: statusCodeForNoData,
              message: statusCodeMessageForData,
              success: false,
              data: {
                user: "User does not exist. Please register to proceed.",
              },
            });

            return responseResult;
          }
        }
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
    const hashedPassword = await bcrypt.hash(
      `${password}`,
      Number(process.env.HASH_PASSWORD),
    );

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
          key: eachError.path[0],
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
          role: "STUDENT",
        })
        .$returningId();

      studentCollegeId = rollNo.match(/\d+(\.\d+)?/g);

      const insertStudent = await db.insert(students).values({
        student_name: name,
        student_email_id: `${email}`,
        student_password: hashedPassword,
        branch_name: branchName,
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

  async registerNewTeacher({
    fullName,
    emailAddress,
    password,
    assignedCourseId,
    experience,
    technicalSkills,
  }: TeacherRegistration) {
    let results;
    let statusCode;
    let statusCodeMessage;
    let dataVariables;

    const hashedPassword = await bcrypt.hash(
      `${password}`,
      Number(process.env.HASH_PASSWORD),
    );

    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, emailAddress));

    const payload = {
      name: fullName,
      email: emailAddress,
      password: password,
      course_id: assignedCourseId,
      experience: experience,
      technical_skills: technicalSkills,
    };

    const checkAppErrorForTeacher = teacherRegistrationSchema.safeParse({
      name: fullName,
      email: emailAddress,
      password: password,
      course_id: assignedCourseId,
      experience: experience,
      technical_skills: technicalSkills,
    });

    if (!checkAppErrorForTeacher?.success) {
      dataVariables = checkAppErrorForTeacher?.error?.issues?.map(
        (eachError) => ({
          key: eachError.path[0],
          message: eachError?.message,
        }),
      );

      statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
      statusCodeMessage = getStatusMessage(statusCode);

      results = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: dataVariables,
      });
      return results;
    }

    if (checkUserInDb?.length > 0) {
      statusCode = StatusCodes.CONFLICT;
      statusCodeMessage = getStatusMessage(statusCode);

      results = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: {
          error: "User already exists.",
        },
      });
      return results;
    } else {
      const insertIntoUsers = await db
        .insert(users)
        .values({
          user_email: emailAddress,
          user_password: hashedPassword,
          role: "TEACHER",
        })
        .$returningId();

      if (insertIntoUsers?.length > 0) {
        const insertIntoTeacherDb = await db.insert(teachers).values({
          teacher_email_id: emailAddress,
          teacher_name: fullName,
          teacher_password: hashedPassword,
          teacher_course_id: assignedCourseId,
          teacher_experience: experience,
          teacher_technicalities: technicalSkills,
          teacher_user_id: insertIntoUsers?.[0].user_id,
        });

        if (insertIntoTeacherDb?.length > 0) {
          statusCode = StatusCodes.OK;
          statusCodeMessage = getStatusMessage(statusCode);

          results = createDataSchemaAndReturnIt({
            status: statusCode,
            message: statusCodeMessage,
            success: true,
            data: {
              success_message: "User registered successfully",
            },
          });

          return results;
        }
      }
    }
  }
}

export const authController = new AuthController();
