import { Router } from "express";
import { ProvidersController } from "./providers.controller";

const router = Router();

router.get("/", ProvidersController.list);
router.get("/:id", ProvidersController.get);

export { router as providersRoutes };
