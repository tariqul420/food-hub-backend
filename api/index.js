// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express from "express";

// src/config/cors.ts
import createCors from "cors";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var env = {
  port: Number(process.env.PORT) || 3e3,
  node_env: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production"
};

// src/config/cors.ts
var origin = env.isProduction ? process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) : false : true;
var cors = createCors({ origin, credentials: true });

// src/config/helmet.ts
import createHelmet from "helmet";
var helmet = createHelmet();

// src/config/logger.ts
import morgan from "morgan";
var logger = env.isProduction ? morgan("combined") : morgan("dev");

// src/config/rate-limit.ts
import rateLimit from "express-rate-limit";
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: env.isProduction ? 100 : 1e3,
  // limit each IP
  standardHeaders: true,
  legacyHeaders: false
});

// src/modules/auth/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/database/prisma.ts
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var globalForPrisma = globalThis;
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/modules/auth/auth.ts
var auth = void 0;

// src/routes/index.ts
import { Router as Router8 } from "express";

// src/modules/admin/users.routes.ts
import { Router } from "express";

// src/shared/middlewares/authorize.middleware.ts
var authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resources!"
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var authorize_middleware_default = authorize;

// src/shared/utils/async-handler.ts
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// src/shared/utils/response.ts
function success(res, data, message = "Success", meta) {
  return res.json({ success: true, message, data, meta });
}
function fail(res, status = 500, message = "Error", details) {
  return res.status(status).json({ success: false, message, details });
}

// src/shared/utils/pagination.ts
function getPagination(query) {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10) || 1);
  const limit = Math.min(100, parseInt(String(query.limit || "10"), 10) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

// src/modules/admin/users.repository.ts
var UsersRepository = {
  find: (opts) => prisma.user.findMany({
    where: opts.where,
    include: { providerProfile: true },
    skip: opts.skip,
    take: opts.take,
    orderBy: opts.orderBy
  }),
  count: (where) => prisma.user.count({ where }),
  update: (id, data) => prisma.user.update({ where: { id }, data })
};

// src/modules/admin/users.service.ts
var AdminUsersService = {
  list: async (query = {}) => {
    const { page, limit, skip, take } = getPagination(query);
    const search = String(query.search || "").trim();
    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    } : {};
    const [users, total] = await Promise.all([
      UsersRepository.find({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" }
      }),
      UsersRepository.count(where)
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },
  update: (id, data) => UsersRepository.update(id, data)
};

// src/modules/admin/users.controller.ts
var AdminUsersController = {
  list: asyncHandler(async (req, res) => {
    const users = await AdminUsersService.list(req.query);
    return success(res, users);
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const updated = await AdminUsersService.update(id, req.body);
    return success(res, updated, "User updated");
  })
};

// src/modules/admin/users.routes.ts
var router = Router();
router.get("/users", authorize_middleware_default("ADMIN" /* ADMIN */), AdminUsersController.list);
router.patch(
  "/users/:id",
  authorize_middleware_default("ADMIN" /* ADMIN */),
  AdminUsersController.update
);

// src/modules/health/health.route.ts
import { Router as Router2 } from "express";

// src/modules/health/health.controller.ts
var health = async (_req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "API is healthy!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
  } catch (error) {
    next(error);
  }
};
var healthController = {
  health
};

// src/modules/health/health.route.ts
var router2 = Router2();
router2.get("/", healthController.health);
var authRoutes = router2;

// src/modules/meals/meals.routes.ts
import { Router as Router3 } from "express";

// src/modules/meals/meals.repository.ts
var MealsRepository = {
  findMany: (filters) => {
    const where = {};
    if (filters.providerProfileId) where.providerProfileId = filters.providerProfileId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isAvailable !== void 0) where.isAvailable = filters.isAvailable === "true";
    if (filters.q) where.title = { contains: filters.q, mode: "insensitive" };
    return prisma.meal.findMany({ where });
  },
  findById: (id) => prisma.meal.findUnique({ where: { id } }),
  create: (data) => prisma.meal.create({ data }),
  update: (id, data) => prisma.meal.update({ where: { id }, data }),
  delete: (id) => prisma.meal.delete({ where: { id } })
};

// src/modules/meals/meals.service.ts
var MealsService = {
  list: (filters) => MealsRepository.findMany(filters),
  get: (id) => MealsRepository.findById(id),
  create: (data) => MealsRepository.create(data),
  update: (id, data) => MealsRepository.update(id, data),
  remove: (id) => MealsRepository.delete(id)
};

// src/modules/meals/meals.controller.ts
var MealsController = {
  list: asyncHandler(async (req, res) => {
    const meals = await MealsService.list(req.query);
    return success(res, meals);
  }),
  get: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const meal = await MealsService.get(id);
    if (!meal) return fail(res, 404, "Meal not found");
    return success(res, meal);
  }),
  create: asyncHandler(async (req, res) => {
    const data = req.body;
    const created = await MealsService.create(data);
    return success(res, created, "Meal created");
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const updated = await MealsService.update(id, req.body);
    return success(res, updated, "Meal updated");
  }),
  remove: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await MealsService.remove(id);
    return success(res, null, "Meal deleted");
  })
};

// src/modules/meals/meals.routes.ts
var router3 = Router3();
router3.get("/", MealsController.list);
router3.get("/:id", MealsController.get);
router3.post("/", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.create);
router3.put("/:id", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.update);
router3.delete("/:id", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.remove);

// src/modules/orders/orders.routes.ts
import { Router as Router4 } from "express";

// src/modules/orders/orders.repository.ts
var OrdersRepository = {
  create: (data) => prisma.order.create({ data, include: { items: true } }),
  findById: (id) => prisma.order.findUnique({ where: { id }, include: { items: true } }),
  findByCustomer: (customerId) => prisma.order.findMany({ where: customerId ? { customerId } : {}, include: { items: true } }),
  updateStatus: (id, status) => prisma.order.update({ where: { id }, data: { status } })
};

// src/modules/orders/orders.service.ts
var OrdersService = {
  create: (data) => OrdersRepository.create(data),
  get: (id) => OrdersRepository.findById(id),
  list: (customerId) => OrdersRepository.findByCustomer(customerId),
  updateStatus: (id, status) => OrdersRepository.updateStatus(id, status)
};

// src/modules/orders/orders.controller.ts
var OrdersController = {
  create: asyncHandler(async (req, res) => {
    const { customerId, providerProfileId, deliveryAddress, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return fail(res, 400, "No items provided");
    const mealIds = items.map((i) => i.mealId).filter(Boolean);
    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } } });
    const mealMap = {};
    meals.forEach((m) => mealMap[m.id] = m);
    const orderItems = items.map((it) => {
      const meal = mealMap[it.mealId];
      const unitPrice = meal ? meal.price : it.unitPrice || 0;
      const quantity = it.quantity || 1;
      return {
        mealId: it.mealId,
        mealTitle: meal ? meal.title : it.mealTitle || "",
        unitPrice,
        quantity,
        subtotal: unitPrice * quantity
      };
    });
    const total = orderItems.reduce((s, it) => s + it.subtotal, 0);
    const data = {
      customerId: customerId || null,
      providerProfileId: providerProfileId || null,
      deliveryAddress,
      total,
      items: { create: orderItems }
    };
    const created = await OrdersService.create(data);
    return success(res, created, "Order created");
  }),
  list: asyncHandler(async (req, res) => {
    const customerId = req.query.customerId;
    const orders = await OrdersService.list(customerId);
    return success(res, orders);
  }),
  get: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const order = await OrdersService.get(id);
    if (!order) return fail(res, 404, "Order not found");
    return success(res, order);
  }),
  updateStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const id = String(req.params.id);
    const updated = await OrdersService.updateStatus(id, status);
    return success(res, updated, "Order status updated");
  })
};

// src/modules/orders/orders.routes.ts
var router4 = Router4();
router4.post("/", authorize_middleware_default("CUSTOMER" /* CUSTOMER */), OrdersController.create);
router4.get("/", authorize_middleware_default(), OrdersController.list);
router4.get("/:id", authorize_middleware_default(), OrdersController.get);

// src/modules/provider/provider.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.patch(
  "/orders/:id",
  authorize_middleware_default("PROVIDER" /* PROVIDER */),
  OrdersController.updateStatus
);

// src/modules/providers/providers.routes.ts
import { Router as Router6 } from "express";

// src/modules/providers/providers.repository.ts
var ProvidersRepository = {
  findMany: () => prisma.providerProfile.findMany({ where: { isActive: true } }),
  findById: (id) => prisma.providerProfile.findUnique({ where: { id }, include: { meals: true } })
};

// src/modules/providers/providers.service.ts
var ProvidersService = {
  list: () => ProvidersRepository.findMany(),
  get: (id) => ProvidersRepository.findById(id)
};

// src/modules/providers/providers.controller.ts
var ProvidersController = {
  list: asyncHandler(async (_req, res) => {
    const providers = await ProvidersService.list();
    return success(res, providers);
  }),
  get: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const provider = await ProvidersService.get(id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  })
};

// src/modules/providers/providers.routes.ts
var router6 = Router6();
router6.get("/", ProvidersController.list);
router6.get("/:id", ProvidersController.get);

// src/modules/reviews/reviews.routes.ts
import { Router as Router7 } from "express";

// src/modules/reviews/reviews.repository.ts
var ReviewsRepository = {
  create: (data) => prisma.review.create({ data }),
  findByMeal: (mealId) => prisma.review.findMany({ where: { mealId } })
};

// src/modules/reviews/reviews.service.ts
var ReviewsService = {
  create: (data) => ReviewsRepository.create(data),
  listByMeal: (mealId) => ReviewsRepository.findByMeal(mealId)
};

// src/modules/reviews/reviews.controller.ts
var ReviewsController = {
  create: asyncHandler(async (req, res) => {
    const { mealId, customerId, rating, comment } = req.body;
    if (!mealId || !rating) return fail(res, 400, "mealId and rating required");
    const created = await ReviewsService.create({ mealId, customerId: customerId || null, rating, comment });
    return success(res, created, "Review created");
  }),
  listByMeal: asyncHandler(async (req, res) => {
    const mealId = String(req.params.mealId);
    const reviews = await ReviewsService.listByMeal(mealId);
    return success(res, reviews);
  })
};

// src/modules/reviews/reviews.routes.ts
var router7 = Router7();
router7.post("/", authorize_middleware_default("CUSTOMER" /* CUSTOMER */), ReviewsController.create);
router7.get("/meal/:mealId", ReviewsController.listByMeal);

// src/routes/index.ts
var router8 = Router8();
var v1 = Router8();
v1.use("/meals", router3);
v1.use("/providers", router6);
v1.use("/orders", router4);
v1.use("/provider", router5);
v1.use("/reviews", router7);
v1.use("/admin", router);
v1.use("/health", authRoutes);
router8.use("/v1", v1);
var apiRoutes = router8;

// src/shared/middlewares/error.middleware.ts
var errorHandler = (err, _req, res, _) => {
  const statusCode = err.status || 500;
  const errorMessage = err?.message || "Internal server error!";
  const payload = {
    success: false,
    message: errorMessage
  };
  if (!env.isProduction) {
    payload.errors = err?.stack || err;
  }
  res.status(statusCode).json(payload);
};

// src/shared/middlewares/not-found.middleware.ts
function notFound(req, res) {
  res.status(404).json({
    message: `Can't find ${req.originalUrl} on this server!`,
    path: req.originalUrl,
    date: Date()
  });
}

// src/app.ts
var app = express();
app.use(express.json());
app.use(helmet);
app.use(logger);
app.use(cors);
app.use(limiter);
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.all("/api/auth/*splat", (req, res) => {
  if (!auth) {
    return res.status(503).json({ success: false, message: "Auth not ready" });
  }
  return toNodeHandler(auth)(req, res);
});
app.get("/", (_req, res) => {
  res.status(200).json({
    title: "Welcome to your Express app",
    description: "Built with StackKit - A production-ready Express template with TypeScript, security, and best practices.",
    version: "1.0.0",
    docs: "https://github.com/tariqul420/stackkit"
  });
});
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
