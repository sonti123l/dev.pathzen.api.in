import { z } from "zod";
import type { dataSchemaDesign } from "../@types/interfaces/dataSchemaDesign.js";

const createDataSchemaAndReturnIt = ({
  status,
  success,
  error,
  message,
  schema,
}: dataSchemaDesign) => {
  const dataSchema = z.object({
    status: z.number(),
    success: z.boolean().optional(),
    error: z.boolean().optional(),
    message: z.string(),
    data: schema,
  });
  return dataSchema.parse({ status, success, error, message, schema });
};

export default createDataSchemaAndReturnIt;
