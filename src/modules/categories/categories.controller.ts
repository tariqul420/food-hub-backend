import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { success } from "../../shared/utils/response";
import { CategoriesService } from "./categories.service";

export const CategoriesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoriesService.list();
    return success(res, categories);
  }),
  listByAdmin: asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoriesService.listByAdmin(req.query);
    return success(res, categories);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const updated = await CategoriesService.update(id, req.body);
    return success(res, updated, "Category updated");
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await CategoriesService.create(req.body);
    return success(res, created, "Category created");
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await CategoriesService.remove(id);
    return success(res, null, "Category deleted");
  }),
};
