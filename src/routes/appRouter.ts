import { Hono } from "hono";
import { appController } from "../controllers/appController.js";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const appRouter = new Hono();

appRouter.patch("/submodule/:id/settime", async (c) => {
  const id = Number(c.req.param("id"));
  const { live_time } = await c.req.json();

  const results = appController.updateSubmoduleData({ id, live_time });

  return c.json(results, results?.status as ContentfulStatusCode);
});

export default appRouter;
