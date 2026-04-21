import { Hono } from "hono";
import { resController } from "../controllers/resourceController.js";

const resourceRouter = new Hono();

resourceRouter.get("/colleges", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const search = c.req.query("search") || "";

  const getCollegesList = await resController.getColleges({ page, limit, search });

  return c.json(getCollegesList);
});

resourceRouter.get("/domains", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;

  const getDomainsData = await resController.getDomain({ page, limit });

  return c.json(getDomainsData);
});

resourceRouter.get("/courses/:domainId", async (c) => {
  const domain_id = Number(c.req.param("domainId"));

  const results = await resController.getCoursesAccordingToId(domain_id);

  return c.json(results);
});

resourceRouter.get("/course/:courseId", async (c) => {
  const course_id = Number(c.req.param("courseId"));

  const results = await resController.getCourseDetailsByCourseId(course_id);
  return c.json(results);
});

resourceRouter.get("/courses", async (c) => {
  const results = await resController.getAllCourses();

  return c.json(results);
});

export { resourceRouter };
