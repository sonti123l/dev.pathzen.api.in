import { z } from "zod";

const userSchema = z.object({
  email: z.string().email().min(1,"Email required"),
  password: z.string().min(10, "password is invalid"),
  created_at: z.coerce.date().optional(),
});

export default userSchema;
