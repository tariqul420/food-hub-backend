import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import ApiError from "../errors/api-error";

export default function validate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors
      .array()
      .map((e) => `${e.param}: ${e.msg}`)
      .join(", ");
    return next(new ApiError(400, msg));
  }
  next();
}
