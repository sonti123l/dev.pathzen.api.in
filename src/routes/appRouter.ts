import { Hono } from "hono";

const appRouter = new Hono();

appRouter.patch("/submodule/:id/")