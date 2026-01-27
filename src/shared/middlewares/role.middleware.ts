import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/api-error";

export default function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Unauthorized"));
    if (roles.length && !roles.includes(req.user.role))
      return next(new ApiError(403, "Forbidden"));
    next();
  };
}
