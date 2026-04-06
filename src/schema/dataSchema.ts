import { z } from "zod";
import type { dataSchemaDesign } from "../@types/interfaces/dataSchemaDesign.js";

const createDataSchemaAndReturnIt = ({
  status,
  success,
  message,
  data,
}: dataSchemaDesign) => {
  const dataSchemaType = z.union([
    z.record(z.string(), z.any()),
    z.array(z.any()),
    z.null(),
  ]);
  const dataSchema = z.object({
    status: z.number(),
    success: z.boolean().optional(),
    message: z.string(),
    data: dataSchemaType,
  });

  let result = dataSchema.safeParse({
    status,
    success,
    message,
    data,
  })?.data;
  return result;
};

export default createDataSchemaAndReturnIt;
