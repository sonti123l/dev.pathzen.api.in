import { z } from "zod";

const userSchema = z.object({
  email: z.string().min(1,"Email required"),
  password: z.string().min(10, "password is invalid"),
  token: z.string().optional(),
  created_at: z.coerce.date().optional(),
});

export default userSchema;
