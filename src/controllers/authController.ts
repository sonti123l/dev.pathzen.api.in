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
import { otps } from "../db/schema/otps.js";
import { sendOTP } from "../helpers/emailService.js";
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
// import { readCSV } from "../config/insertDataIntoModules.js";
// import { createData } from "../helpers/courseDataStructuring.js";

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
    let dataVariables;
    let tokens: TokenType;

    const userJsonData = userSchema.safeParse({ email, password });

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

    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, email));

    if (checkUserInDb.length > 0) {
      const hashedPassword = await bcrypt.compare(
        `${password}`,
        checkUserInDb[0]?.user_password,
      );
      if (!hashedPassword) {
        statusCodeForNoData = StatusCodes.UNAUTHORIZED;

        responseResult = createDataSchemaAndReturnIt({
          status: statusCodeForNoData,
          message: "Authentication is required. Invalid credentials",
          success: false,
          data: {
            message: "Invalid Email or Password",
          },
        });

        return responseResult;
      }

      if (checkUserInDb?.[0].role?.toUpperCase() === "STUDENT") {
        const getStudentFromDb = await db
          .select()
          .from(students)
          .where(eq(students.student_id, checkUserInDb[0]?.user_id));

        tokens = await token({
          email: email,
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

        // Fallback if refresh token update fails
        statusCodeForNoData = StatusCodes.INTERNAL_SERVER_ERROR;
        statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
        responseResult = createDataSchemaAndReturnIt({
          status: statusCodeForNoData,
          message: statusCodeMessageForData,
          success: false,
          data: { error: "Failed to update session. Please try again." },
        });
        return responseResult;

      } else {
        const getTeacherDetails = await db
          .select()
          .from(teachers)
          .where(eq(teachers.teacher_user_id, checkUserInDb[0]?.user_id));

        if (getTeacherDetails?.length > 0) {
          tokens = await token({
            email: email,
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
          }
        }

        // Fallback if teacher not found or session update fails
        statusCodeForNoData = StatusCodes.INTERNAL_SERVER_ERROR;
        statusCodeMessageForData = getStatusMessage(statusCodeForNoData);
        responseResult = createDataSchemaAndReturnIt({
          status: statusCodeForNoData,
          message: statusCodeMessageForData,
          success: false,
          data: { error: "Login failed. Please try again." },
        });
        return responseResult;
      }
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
    let sendingStatusCodes;
    let sendingMessageForUser;
    let responseResult;
    let dataVariables;

    // ✅ Step 1: Validate with Zod FIRST — before any DB queries or hashing
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

    // ✅ Step 2: Hash password only after validation passes
    const hashedPassword = await bcrypt.hash(
      `${password}`,
      Number(process.env.HASH_PASSWORD),
    );

    // ✅ Step 3: Check for existing user by EMAIL ONLY (not by hashed password)
    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, email));

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
    }

    // ✅ Step 4: Insert into users table
    const insertUser = await db
      .insert(users)
      .values({
        user_email: email,
        user_password: hashedPassword,
        role: "STUDENT",
      })
      .$returningId();

    // ✅ Step 5: Safely parse roll number — strip non-digits to avoid NaN
    const parsedRollNo = parseInt(String(rollNo).replace(/\D/g, ""), 10);
    const safeRollNo = isNaN(parsedRollNo) ? 0 : parsedRollNo;

    const insertStudent = await db.insert(students).values({
      student_name: name,
      student_email_id: `${email}`,
      student_password: hashedPassword,
      branch_name: branchName,
      student_roll_no: safeRollNo,
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

    // ✅ Fallback — prevents function from returning undefined
    sendingStatusCodes = StatusCodes.INTERNAL_SERVER_ERROR;
    sendingMessageForUser = getStatusMessage(sendingStatusCodes);
    return createDataSchemaAndReturnIt({
      status: sendingStatusCodes,
      message: sendingMessageForUser,
      success: false,
      data: { error: "Registration failed unexpectedly. Please try again." },
    });
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

    // ✅ Step 1: Validate with Zod FIRST
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

    // ✅ Step 2: Hash password after validation
    const hashedPassword = await bcrypt.hash(
      `${password}`,
      Number(process.env.HASH_PASSWORD),
    );

    // ✅ Step 3: Check for duplicate email only
    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, emailAddress));

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
    }

    // ✅ Step 4: Insert into users and teachers tables
    const insertIntoUsers = await db
      .insert(users)
      .values({
        user_email: emailAddress,
        user_password: hashedPassword,
        role: "TEACHER",
      })
      .$returningId();

    if (insertIntoUsers?.length > 0) {
      await db.insert(teachers).values({
        teacher_email_id: emailAddress,
        teacher_name: fullName,
        teacher_password: hashedPassword,
        teacher_course_id: assignedCourseId,
        teacher_experience: experience,
        teacher_technicalities: technicalSkills,
        teacher_user_id: insertIntoUsers?.[0].user_id,
      });

      statusCode = StatusCodes.OK;
      statusCodeMessage = getStatusMessage(statusCode);

      results = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: true,
        data: {
          success_message: "Teacher registered successfully",
        },
      });

      return results;
    }

    // ✅ Fallback
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    statusCodeMessage = getStatusMessage(statusCode);
    return createDataSchemaAndReturnIt({
      status: statusCode,
      message: statusCodeMessage,
      success: false,
      data: { error: "Teacher registration failed. Please try again." },
    });
  }

  async forgotPassword(email: string) {
    let responseResult;
    let statusCode;

    console.log(" Forgot password called with email: ", email);
    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, email));

    if (checkUserInDb.length === 0) {
      statusCode = StatusCodes.NOT_FOUND;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "User not found",
        success: false,
        data: { error: "User with this email does not exist." },
      });
      return responseResult;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(otps).where(eq(otps.email, email));

    await db.insert(otps).values({
      email: email,
      otp: otp,
      expires_at: expiresAt,
      user_id: checkUserInDb[0].user_id,
    });

    const isEmailSent = await sendOTP(email, otp);

    if (!isEmailSent) {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "Failed to send OTP",
        success: false,
        data: { error: "Could not send OTP email. Please try again later." },
      });
      return responseResult;
    }

    statusCode = StatusCodes.OK;
    responseResult = createDataSchemaAndReturnIt({
      status: statusCode,
      message: "OTP sent successfully",
      success: true,
      data: { success_message: "An OTP has been sent to your email address." },
    });
    return responseResult;
  }

  async verifyOtp(email: string, otp: string) {
    let responseResult;
    let statusCode;

    const otpRecord = await db
      .select()
      .from(otps)
      .where(and(eq(otps.email, email), eq(otps.otp, otp)));

    if (otpRecord.length === 0) {
      statusCode = StatusCodes.BAD_REQUEST;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "Invalid OTP",
        success: false,
        data: { error: "The provided OTP is incorrect." },
      });
      return responseResult;
    }

    const currentDateTime = new Date();
    if (new Date(otpRecord[0].expires_at) < currentDateTime) {
      statusCode = StatusCodes.BAD_REQUEST;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "Expired OTP",
        success: false,
        data: { error: "The provided OTP has expired. Please request a new one." },
      });
      return responseResult;
    }

    statusCode = StatusCodes.OK;
    responseResult = createDataSchemaAndReturnIt({
      status: statusCode,
      message: "OTP verified successfully",
      success: true,
      data: { success_message: "OTP is valid." },
    });
    return responseResult;
  }

  async resendOtp(email: string) {
    let responseResult;
    let statusCode;

    const checkUserInDb = await db
      .select()
      .from(users)
      .where(eq(users.user_email, email));

    if (checkUserInDb.length === 0) {
      statusCode = StatusCodes.NOT_FOUND;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "User not found",
        success: false,
        data: { error: "User with this email does not exist." },
      });
      return responseResult;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs
    await db.delete(otps).where(eq(otps.email, email));

    // Insert new OTP
    await db.insert(otps).values({
      email: email,
      otp: otp,
      expires_at: expiresAt,
      user_id: checkUserInDb[0].user_id,
    });

    const isEmailSent = await sendOTP(email, otp);

    if (!isEmailSent) {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      responseResult = createDataSchemaAndReturnIt({
        status: statusCode,
        message: "Failed to resend OTP",
        success: false,
        data: { error: "Could not send OTP email. Please try again later." },
      });
      return responseResult;
    }

    statusCode = StatusCodes.OK;
    responseResult = createDataSchemaAndReturnIt({
      status: statusCode,
      message: "OTP resent successfully",
      success: true,
      data: { success_message: "A new OTP has been sent to your email address." },
    });
    return responseResult;
  }

  async resetPassword(email: string, otp: string, newPassword: string) {


    // Verify OTP first
    const verifyResult = await this.verifyOtp(email, otp);
    if (!verifyResult?.success) {
      return verifyResult;
    }

    const hashedPassword = await bcrypt.hash(
      `${newPassword}`,
      Number(process.env.HASH_PASSWORD),
    );

    await db
      .update(users)
      .set({ user_password: hashedPassword })
      .where(eq(users.user_email, email));

    await db.delete(otps).where(eq(otps.email, email));

    const statusCode = StatusCodes.OK;
    const responseResult = createDataSchemaAndReturnIt({
      status: statusCode,
      message: "Password reset successfully",
      success: true,
      data: { success_message: "Your password has been changed successfully. You can now login." },
    });
    return responseResult;
  }
}

export const authController = new AuthController();
