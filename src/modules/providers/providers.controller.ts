import { Request, Response } from "express";
import asyncHandler from "../../shared/utils/async-handler";
import { getPagination } from "../../shared/utils/pagination";
import { fail, success } from "../../shared/utils/response";
import { ProvidersService } from "./providers.service";

export const ProvidersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const { skip, take } = getPagination(query);

    const opts: any = { skip, take };

    // search by name or description
    const search = String(query.search || "").trim();
    if (search) {
      opts.where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // map sort param to orderBy
    const sort = String(query.sort || "").trim();
    if (sort) {
      switch (sort) {
        case "newest":
          opts.orderBy = { createdAt: "desc" };
          break;
        default:
          if (/^[a-zA-Z0-9_]+_(asc|desc)$/.test(sort)) {
            const [field, dir] = sort.split("_");
            opts.orderBy = { [field]: dir as "asc" | "desc" };
          }
          break;
      }
    }

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
