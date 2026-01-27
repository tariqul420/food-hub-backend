import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { OrdersController } from "../orders/orders.controller";

const router = Router();

// Update order status (provider)
router.patch(
  "/orders/:id",
  authorize(UserRole.PROVIDER),
  OrdersController.updateStatus,
);

export { router as providerRoutes };
