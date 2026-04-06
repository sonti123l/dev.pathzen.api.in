import { z } from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    created_at: z.date().optional()
})


export default userSchema;