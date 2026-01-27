import express, { Application, Request, Response } from "express";
import { cors } from "./config/cors";
import { helmet } from "./config/helmet";
import { logger } from "./config/logger";
import { authRoutes } from "./features/health/health.route";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/not-found.middleware";
import { auth } from "../lib/auth";
import { toNodeHandler } from "better-auth/node";

// app initialization
const app: Application = express();
app.use(express.json());

app.use(helmet);
app.use(logger);
app.use(cors);

// Home page route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    title: "Welcome to your Express app",
    description:
      "Built with StackKit - A production-ready Express template with TypeScript, security, and best practices.",
    version: "1.0.0",
    docs: "https://github.com/tariqul420/stackkit",
  });
});

// routes
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/health", authRoutes);

// unhandled routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
