import { Router } from "express";
import { MealsController } from "./meals.controller";

const router = Router();

router.get("/", MealsController.list);
router.get("/:id", MealsController.get);
router.post("/", MealsController.create);
router.put("/:id", MealsController.update);
router.delete("/:id", MealsController.remove);

export { router as mealsRoutes };
