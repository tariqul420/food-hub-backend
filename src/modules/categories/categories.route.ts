import { Router } from "express";
import authorize, { UserRole } from "../../shared/middlewares/authorize.middleware";
import { CategoriesController } from "./categories.controller";

const router = Router();

router.get("/admin", authorize(UserRole.ADMIN), CategoriesController.list);


export { router as categoriesRoutes };
