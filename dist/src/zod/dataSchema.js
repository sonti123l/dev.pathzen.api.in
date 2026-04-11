import { z } from "zod";
const createDataSchemaAndReturnIt = ({ status, success, message, token, data, }) => {
    const dataSchemaType = z.union([
        z.record(z.string(), z.any()),
        z.array(z.any()),
        z.null(),
    ]);
    const tokenSchemaType = z.record(z.string(), z.any()).optional();
    const dataSchema = z.object({
        status: z.number(),
        success: z.boolean(),
        message: z.string(),
        token: tokenSchemaType,
        data: dataSchemaType,
    });
    let result = token
        ? dataSchema.safeParse({
            status,
            success,
            message,
            token,
            data,
        })?.data
        : dataSchema.safeParse({
            status,
            success,
            message,
            data,
        })?.data;
    return result;
};
export default createDataSchemaAndReturnIt;
