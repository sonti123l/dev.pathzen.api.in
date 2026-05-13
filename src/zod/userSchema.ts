import { z } from "zod";

const userSchema = z.object({
  email: z.coerce.string().min(1, "Email required"),
  password: z.coerce.string().min(8, "password is invalid"),
  token: z.coerce.string().optional(),
  created_at: z.coerce.date().optional(),
});

export default userSchema;
