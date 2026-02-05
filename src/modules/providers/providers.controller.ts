import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { fail, success } from "../../shared/utils/response";
import { ProvidersService } from "./providers.service";

export const ProvidersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { limit, skip, page } = req.query as any;
    const opts: any = {};
    if (limit) opts.take = Number(limit);
    if (skip) opts.skip = Number(skip);
    const providers = await ProvidersService.list(opts);
    return success(res, providers);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const provider = await ProvidersService.get(id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  }),
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");
    const provider = await ProvidersService.getByUserId(user.id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");
    const data = { ...(req.body || {}), userId: user.id };

    // prevent duplicate provider for a user
    const existing = await ProvidersService.getByUserId(user.id);
    if (existing) {
      return fail(res, 409, "Provider profile already exists for user");
    }

    const created = await ProvidersService.create(data);
    return success(res, created, "Provider created");
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");

    const existing = await ProvidersService.get(id);
    if (!existing) return fail(res, 404, "Provider not found");

    // only owner or admin can update
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return fail(res, 403, "Forbidden");
    }

    const updated = await ProvidersService.update(id, req.body);
    return success(res, updated, "Provider updated");
  }),
};
