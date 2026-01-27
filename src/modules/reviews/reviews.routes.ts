import { Router } from "express";
import { ReviewsController } from "./reviews.controller";

const router = Router();

router.post("/", ReviewsController.create);
router.get("/meal/:mealId", ReviewsController.listByMeal);

export { router as reviewsRoutes };
