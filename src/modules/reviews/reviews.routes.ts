import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { ReviewsController } from "./reviews.controller";

const router = Router();

router.post("/", authorize(UserRole.CUSTOMER), ReviewsController.create);
router.get("/meal/:mealId", ReviewsController.listByMeal);

export { router as reviewsRoutes };
