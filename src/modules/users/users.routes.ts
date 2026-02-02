import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { UsersController } from "./users.controller";

const router = Router();

router.get("/admin", authorize(UserRole.ADMIN), UsersController.list);
router.patch("/admin/:id", authorize(UserRole.ADMIN), UsersController.update);

export { router as usersRoutes };
