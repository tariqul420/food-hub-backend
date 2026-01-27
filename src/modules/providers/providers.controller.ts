import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { fail, success } from "../../shared/utils/response";
import { ProvidersService } from "./providers.service";

export const ProvidersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const providers = await ProvidersService.list();
    return success(res, providers);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const provider = await ProvidersService.get(id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  }),
};
