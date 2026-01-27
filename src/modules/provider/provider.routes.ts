import { Router } from "express";
import { OrdersController } from "../orders/orders.controller";

const router = Router();

// Update order status (provider)
router.patch("/orders/:id", OrdersController.updateStatus);

export { router as providerRoutes };
