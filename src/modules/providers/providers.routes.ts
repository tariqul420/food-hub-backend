import { Router } from "express";
import authorize from "../../shared/middlewares/authorize.middleware";
import { ProvidersController } from "./providers.controller";

const router = Router();

router.get("/", ProvidersController.list);
router.get("/me", authorize(), ProvidersController.getMe);
router.get("/:id", ProvidersController.get);
router.post("/", authorize(), ProvidersController.create);
router.put("/:id", authorize(), ProvidersController.update);

export { router as providersRoutes };
