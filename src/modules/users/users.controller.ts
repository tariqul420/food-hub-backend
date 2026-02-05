import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { success } from "../../shared/utils/response";
import { UsersService } from "./users.service";

export const UsersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const users = await UsersService.list(req.query);
    return success(res, users);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    if (
      req.user &&
      req.user.id === id &&
      req.body?.role &&
      req.body.role !== req.user.role
    ) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot change your own role" });
    }
    const updated = await UsersService.update(id, req.body);
    return success(res, updated, "User updated");
  }),
};
