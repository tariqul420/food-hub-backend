import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { AdminUsersController } from "./users.controller";

const router = Router();

router.get("/users", authorize(UserRole.ADMIN), AdminUsersController.list);
router.patch(
  "/users/:id",
  authorize(UserRole.ADMIN),
  AdminUsersController.update,
);

export { router as adminRoutes };
