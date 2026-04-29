import { Hono } from "hono";
import { authController } from "../controllers/authController.js";
const authRouter = new Hono();
authRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    const result = await authController.getUserLoginCredentials({
        email,
        password,
    });
    return c.json(result, result?.status);
});
authRouter.post("/register", async (c) => {
    const { name, email, password, branchName, collegeId, domainId, rollNo, courseId, } = await c.req.json();
    const result = await authController.registerNewUser({
        name,
        email,
        password,
        branchName,
        collegeId,
        domainId,
        rollNo,
        courseId,
    });
    return c.json(result, result?.status);
});
authRouter.post("/register-teacher", async (c) => {
    const { fullName, email, password, courseId, technicalSkills, experience } = await c.req.json();
    const result = await authController.registerNewTeacher({
        fullName: fullName,
        emailAddress: email,
        password: password,
        assignedCourseId: courseId,
        experience: experience,
        technicalSkills: technicalSkills,
    });
    return c.json(result, result?.status);
});
export { authRouter };
