import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { OrdersController } from "./orders.controller";

const router = Router();

router.post("/", authorize(UserRole.CUSTOMER), OrdersController.create);
router.get(
  "/provider/:providerId",
  authorize(UserRole.PROVIDER),
  OrdersController.listByProvider,
);
router.get("/admin", authorize(UserRole.ADMIN), OrdersController.listByAdmin);
router.get("/", authorize(), OrdersController.list);
router.get("/:id", authorize(), OrdersController.get);
router.patch("/:id", authorize(), OrdersController.updateStatus);
router.delete("/:id", authorize(), OrdersController.delete);

export { router as ordersRoutes };
