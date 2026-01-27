import { Router } from "express";
import { adminRoutes } from "../modules/admin/users.routes";
import { authRoutes as healthRoutes } from "../modules/health/health.route";
import { mealsRoutes } from "../modules/meals/meals.routes";
import { ordersRoutes } from "../modules/orders/orders.routes";
import { providerRoutes } from "../modules/provider/provider.routes";
import { providersRoutes } from "../modules/providers/providers.routes";
import { reviewsRoutes } from "../modules/reviews/reviews.routes";

const router = Router();

// versioned API
const v1 = Router();

v1.use("/meals", mealsRoutes);
v1.use("/providers", providersRoutes);
v1.use("/orders", ordersRoutes);
v1.use("/provider", providerRoutes);
v1.use("/reviews", reviewsRoutes);
v1.use("/admin", adminRoutes);
v1.use("/health", healthRoutes);

router.use("/v1", v1);

export default router;
