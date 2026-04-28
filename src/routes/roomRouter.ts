import { Hono } from "hono";
import { roomController } from "../controllers/roomController.js";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const roomRouter = new Hono();

roomRouter.post("/golive/:subModuleId", async (c) => {
  const subModuleId = Number(c.req.param("subModuleId"));
  const { role, title, createdBy } = await c.req.json();

  const payload = {
    role: role,
    title: title,
    createdBy: createdBy,
  };

  const results = await roomController.createLiveInputForTeacher({
    subModuleId,
    payload,
  });

  return c.json(results, results?.status as ContentfulStatusCode);
});

roomRouter.get("/active/:subModuleId", async (c) => {
  const subModuleId = Number(c.req.param("subModuleId"));

  const result = await roomController.getActiveLive({ subModuleId });
  return c.json(result);
});

roomRouter.post("/end/:roomId", async (c) => {
  const { role } = await c.req.json();
  const roomId = c.req.param("roomId");

  const result = await roomController.endLive({
    roomId,
    payload: { role: role },
  });

  return c.json(result);
});

export default roomRouter;
