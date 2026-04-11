import { z } from "zod";

export const userRegisterFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required"),
    password: z.string().min(8, "Password not satisfied requirement"),
    branch_name: z.string(),
    college_id: z.int().min(1),
    domain_id: z.int().min(1),
    roll_no: z.string().min(1, "Roll number is required"),
    course_id: z.int().min(1),
}).strict();