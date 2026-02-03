import { Router } from "express";
import authorize, { UserRole } from "../../shared/middlewares/authorize.middleware";
import { CategoriesController } from "./categories.controller";

const router = Router();

router.get("/", CategoriesController.list);
router.get(
  "/admin",
  authorize(UserRole.ADMIN),
  CategoriesController.listByAdmin,
);
router.post("/", authorize(UserRole.ADMIN), CategoriesController.create);
router.put("/:id", authorize(UserRole.ADMIN), CategoriesController.update);
router.delete("/:id", authorize(UserRole.ADMIN), CategoriesController.remove);

export { router as categoriesRoutes };
