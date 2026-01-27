import { Router } from "express";
import { AdminUsersController } from "./users.controller";

const router = Router();

router.get("/users", AdminUsersController.list);
router.patch("/users/:id", AdminUsersController.update);

export { router as adminRoutes };
