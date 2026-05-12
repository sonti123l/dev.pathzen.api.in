import { z } from "zod";

export const userRegisterFormSchema = z
  .object({
    name: z.coerce.string().min(1, "Name is required"),
    email: z.coerce.string().min(1, "Email is required"),
    password: z.coerce.string().min(8, "Password is required"),
    branch_name: z.string().min(1, "Branch name is required"),
    college_id: z.int().min(1, "College is required"),
    domain_id: z.coerce.number().min(1, "Domain is required"),
    roll_no: z.coerce.string().min(1, "Roll number is required"),
    course_id: z.int().min(1, "Course is required"),
  })
  .strict();

export const teacherRegistrationSchema = z
  .object({
    name: z.coerce.string().min(1, "Name is required"),
    email: z.coerce.string().min(1, "Email is required"),
    password: z.coerce.string().min(8, "Password is required"),
    course_id: z.int().min(1, "Domain is required"),
    experience: z.string().min(1, "Experience is required"),
    technical_skills: z.object({
      skills: z.array(z.string()).min(1, "At least one skill is required"),
    }),
  })
  .strict();
