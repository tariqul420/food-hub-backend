import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _: NextFunction,
) => {
  const statusCode = err.status || 500;
  const errorMessage = err?.message || "Internal server error!";

  const payload: any = {
    success: false,
    message: errorMessage,
  };

  if (!envVars.isProduction) {
    payload.errors = err?.stack || err;
  }

  res.status(statusCode).json(payload);
};
