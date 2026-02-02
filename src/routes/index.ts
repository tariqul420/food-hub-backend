import { Router } from "express";
import { categoriesRoutes } from "../modules/categories/categories.route";
import { mealsRoutes } from "../modules/meals/meals.routes";
import { ordersRoutes } from "../modules/orders/orders.routes";
import { providersRoutes } from "../modules/providers/providers.routes";
import { reviewsRoutes } from "../modules/reviews/reviews.routes";
import { usersRoutes } from "../modules/users/users.routes";

const router = Router();

// versioned API
const v1 = Router();

v1.use("/meals", mealsRoutes);
v1.use("/providers", providersRoutes);
v1.use("/orders", ordersRoutes);
v1.use("/reviews", reviewsRoutes);
v1.use("/users", usersRoutes);
v1.use("/categories", categoriesRoutes);

router.use("/v1", v1);

export const apiRoutes = router;
