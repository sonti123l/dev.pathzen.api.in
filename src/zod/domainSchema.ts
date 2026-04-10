import { z } from "zod";

export const domainSchema = z.object({
    page: z.int(),
    limit: z.int(),
    total_pages: z.int(),
    total_records: z.int()
})