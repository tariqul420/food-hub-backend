import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler";
import { success, fail } from "../../shared/utils/response";
import { ReviewsService } from "./reviews.service";

export const ReviewsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { mealId, customerId, rating, comment } = req.body;
    if (!mealId || !rating) return fail(res, 400, "mealId and rating required");
    const created = await ReviewsService.create({ mealId, customerId: customerId || null, rating, comment });
    return success(res, created, "Review created");
  }),

  listByMeal: asyncHandler(async (req: Request, res: Response) => {
    const mealId = req.params.mealId;
    const reviews = await ReviewsService.listByMeal(mealId);
    return success(res, reviews);
  }),
};
