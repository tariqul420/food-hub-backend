import { Router } from "express";
import authorize, {
  UserRole,
} from "../../shared/middlewares/authorize.middleware";
import { MealsController } from "./meals.controller";

const router = Router();

router.get("/", MealsController.list);
router.get("/:id", MealsController.get);
router.post("/", authorize(UserRole.PROVIDER), MealsController.create);
router.put("/:id", authorize(UserRole.PROVIDER), MealsController.update);
router.delete("/:id", authorize(UserRole.PROVIDER), MealsController.remove);

export { router as mealsRoutes };
