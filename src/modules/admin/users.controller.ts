import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { success } from "../../shared/utils/response";
import { AdminUsersService } from "./users.service";

export const AdminUsersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const users = await AdminUsersService.list(req.query);
    return success(res, users);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const updated = await AdminUsersService.update(id, req.body);
    return success(res, updated, "User updated");
  }),
};
