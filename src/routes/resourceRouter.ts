import { Hono } from "hono";
import { resController } from "../controllers/resourceController.js";

const resourceRouter = new Hono();

resourceRouter.get("/colleges", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;

  const getCollegesList = await resController.getColleges({ page, limit });
  

  return c.json(getCollegesList);
});

export { resourceRouter };
