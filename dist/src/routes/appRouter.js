import { Hono } from "hono";
import { appController } from "../controllers/appController.js";
const appRouter = new Hono();
appRouter.patch("/submodule/:id/settime", async (c) => {
    const id = Number(c.req.param("id"));
    const { live_time, live_date } = await c.req.json();
    const results = await appController.updateSubmoduleData({
        id,
        live_time,
        live_date,
    });
    return c.json(results, results?.status);
});
export default appRouter;
