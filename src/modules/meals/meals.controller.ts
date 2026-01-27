import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler";
import { success, fail } from "../../shared/utils/response";
import { MealsService } from "./meals.service";

export const MealsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const meals = await MealsService.list(req.query);
    return success(res, meals);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const meal = await MealsService.get(req.params.id);
    if (!meal) return fail(res, 404, "Meal not found");
    return success(res, meal);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const created = await MealsService.create(data);
    return success(res, created, "Meal created");
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await MealsService.update(req.params.id, req.body);
    return success(res, updated, "Meal updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await MealsService.remove(req.params.id);
    return success(res, null, "Meal deleted");
  }),
};
