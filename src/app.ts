import { toNodeHandler } from "better-auth/node";
import express, { Application, Request, Response } from "express";
import { cors } from "./config/cors";
import { helmet } from "./config/helmet";
import { logger } from "./config/logger";
import { limiter } from "./config/rate-limit";
import { auth } from "./modules/auth/auth";
import { apiRoutes } from "./routes/index";
import { errorHandler } from "./shared/middlewares/error.middleware";
import { notFound } from "./shared/middlewares/not-found.middleware";

// app initialization
const app: Application = express();
app.use(express.json());

app.use(helmet);
app.use(logger);
app.use(cors);
app.use(limiter);

// trust proxy when behind proxies (load balancers)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.all("/api/auth/*splat", (req: Request, res: Response) => {
  if (!auth) {
    return res.status(503).json({ success: false, message: "Auth not ready" });
  }
  return toNodeHandler(auth)(req, res);
});

// Home page route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    title: "Food Hub API",
    description:
      "Backend API for Food Hub — manage meals, providers, orders, and reviews.",
    version: "1.0.0",
    docs: "https://github.com/tariqul420/food-hub-backend",
  });
});

// API routes (versioned)
app.use("/api", apiRoutes);

// unhandled routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
