import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { success } from "../../shared/utils/response";
import { CategoriesService } from "./categories.service";

export const CategoriesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoriesService.list(req.query);
    return success(res, categories);
  }),
};
