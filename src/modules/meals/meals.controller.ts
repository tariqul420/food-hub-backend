import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { fail, success } from "../../shared/utils/response";
import { MealsService } from "./meals.service";

export const MealsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const meals = await MealsService.list(req.query);
    return success(res, meals);
  }),
  listByProvider: asyncHandler(async (req: Request, res: Response) => {
    const providerId = String(req.params.providerId);
    const meals = await MealsService.listByProvider(providerId, req.query);
    return success(res, meals);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const meal = await MealsService.get(id);
    if (!meal) return fail(res, 404, "Meal not found");
    return success(res, meal);
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...(req.body || {}) };
    if ((req as any).user?.id) data.userId = (req as any).user.id;
    const created = await MealsService.create(data);
    return success(res, created, "Meal created");
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = { ...(req.body || {}) };
    if ((req as any).user?.id) data.userId = (req as any).user.id;
    const updated = await MealsService.update(id, data);
    return success(res, updated, "Meal updated");
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await MealsService.remove(id);
    return success(res, null, "Meal deleted");
  }),
};
