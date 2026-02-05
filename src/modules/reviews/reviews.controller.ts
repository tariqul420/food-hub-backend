import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { fail, success } from "../../shared/utils/response";
import { ReviewsService } from "./reviews.service";

export const ReviewsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { mealId, customerId, rating, comment } = req.body;
    if (!mealId || !rating) return fail(res, 400, "mealId and rating required");
    const created = await ReviewsService.create({
      mealId,
      customerId: customerId || null,
      rating,
      comment,
    });
    return success(res, created, "Review created");
  }),

  listByMeal: asyncHandler(async (req: Request, res: Response) => {
    const mealId = String(req.params.mealId);
    const reviews = await ReviewsService.listByMeal(mealId);
    return success(res, reviews);
  }),
  listRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit || 5);
    const reviews = await ReviewsService.listRecent(limit);
    return success(res, reviews);
  }),
};
