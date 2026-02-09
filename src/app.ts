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

  const originalSetHeader = res.setHeader.bind(res);

  const sessionCookieNameRE =
    /^\s*(?:better-auth\.session_token|__secure-better-auth\.session_token|better-auth_session_token)\s*=/i;

  function deriveCookieDomain(req: Request) {
    if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN;
    const host = (req.hostname || String(req.headers.host || "")).split(":")[0];
    if (!host) return "";
    const parts = host.split(".");
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`;
    }
    return host;
  }

  function rewriteSetCookieValue(setCookieValue: string, cookieDomain: string) {
    const nameValue = setCookieValue.split(/;\s*/)[0];
    const attrs = ["Path=/"];
    if (cookieDomain) attrs.push(`Domain=${cookieDomain}`);
    attrs.push("Secure", "SameSite=None");
    return [nameValue, ...attrs].join("; ");
  }

  res.setHeader = (
    name: string,
    value: number | string | ReadonlyArray<string>,
  ) => {
    if (typeof name === "string" && name.toLowerCase() === "set-cookie") {
      const cookieDomain = deriveCookieDomain(req);
      const cookies = Array.isArray(value) ? value.slice() : [String(value)];
      const rewritten = cookies.map((c) => {
        if (sessionCookieNameRE.test(c)) {
          return rewriteSetCookieValue(c, cookieDomain);
        }
        return c;
      });
      return originalSetHeader(
        "Set-Cookie",
        rewritten as unknown as string | string[],
      );
    }
    return originalSetHeader(name, value as any);
  };

  const cleanup = () => {
    try {
      res.setHeader = originalSetHeader as unknown as typeof res.setHeader;
    } catch {
      // ignore
    }
  };
  res.once("finish", cleanup);
  res.once("close", cleanup);

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
