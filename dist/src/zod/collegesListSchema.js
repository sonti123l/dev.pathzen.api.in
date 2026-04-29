import { z } from "zod";
export const collegeListSchema = z.object({
    page: z.int(),
    total_records: z.int(),
    total_pages: z.int(),
    limit: z.int(),
});
