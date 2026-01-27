import { Router } from "express";
import { OrdersController } from "./orders.controller";

const router = Router();

router.post("/", OrdersController.create);
router.get("/", OrdersController.list);
router.get("/:id", OrdersController.get);

export { router as ordersRoutes };
