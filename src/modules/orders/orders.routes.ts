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
router.get("/", authorize(), OrdersController.list);
router.get("/:id", authorize(), OrdersController.get);

export { router as ordersRoutes };
