import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler";
import { success } from "../../shared/utils/response";
import { AdminUsersService } from "./users.service";

export const AdminUsersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await AdminUsersService.list();
    return success(res, users);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await AdminUsersService.update(req.params.id, req.body);
    return success(res, updated, "User updated");
  }),
};
