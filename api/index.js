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
import { Router as Router7 } from "express";

// src/modules/categories/categories.route.ts
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

// src/modules/categories/categories.repository.ts
var CategoriesRepository = {
  find: () => prisma.category.findMany(),
  findByAdmin: (opts) => prisma.category.findMany({
    where: opts.where,
    skip: opts.skip,
    take: opts.take,
    orderBy: opts.orderBy
  }),
  count: (where) => prisma.category.count({ where }),
  findById: (id) => prisma.category.findUnique({ where: { id } }),
  create: (data) => prisma.category.create({ data }),
  update: (id, data) => prisma.category.update({ where: { id }, data }),
  delete: (id) => prisma.category.delete({ where: { id } })
};

// src/modules/categories/categories.service.ts
var CategoriesService = {
  list: async () => {
    return CategoriesRepository.find();
  },
  listByAdmin: async (query = {}) => {
    const { page, limit, skip, take } = getPagination(query);
    const search = String(query.search || "").trim();
    const where = search ? {
      OR: [{ name: { contains: search, mode: "insensitive" } }]
    } : {};
    const [categories, total] = await Promise.all([
      CategoriesRepository.findByAdmin({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" }
      }),
      CategoriesRepository.count(where)
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },
  update: (id, data) => CategoriesRepository.update(id, data),
  create: (data) => CategoriesRepository.create(data),
  remove: (id) => CategoriesRepository.delete(id)
};

// src/modules/categories/categories.controller.ts
var CategoriesController = {
  list: asyncHandler(async (req, res) => {
    const categories = await CategoriesService.list();
    return success(res, categories);
  }),
  listByAdmin: asyncHandler(async (req, res) => {
    const categories = await CategoriesService.listByAdmin(req.query);
    return success(res, categories);
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const updated = await CategoriesService.update(id, req.body);
    return success(res, updated, "Category updated");
  }),
  create: asyncHandler(async (req, res) => {
    const created = await CategoriesService.create(req.body);
    return success(res, created, "Category created");
  }),
  remove: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await CategoriesService.remove(id);
    return success(res, null, "Category deleted");
  })
};

// src/modules/categories/categories.route.ts
var router = Router();
router.get("/", CategoriesController.list);
router.get(
  "/admin",
  authorize_middleware_default("ADMIN" /* ADMIN */),
  CategoriesController.listByAdmin
);
router.post("/", authorize_middleware_default("ADMIN" /* ADMIN */), CategoriesController.create);
router.put("/:id", authorize_middleware_default("ADMIN" /* ADMIN */), CategoriesController.update);
router.delete("/:id", authorize_middleware_default("ADMIN" /* ADMIN */), CategoriesController.remove);

// src/modules/meals/meals.routes.ts
import { Router as Router2 } from "express";

// src/modules/meals/meals.repository.ts
var MealsRepository = {
  find: (filters) => {
    const where = {};
    if (filters.providerProfileId) {
      where.providerProfileId = filters.providerProfileId;
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isAvailable !== void 0) {
      where.isAvailable = filters.isAvailable === "true";
    }
    const searchTerm = (filters.search ?? filters.q ?? "").toString().trim();
    if (searchTerm) {
      where.title = { contains: searchTerm, mode: "insensitive" };
    }
    const rawTake = filters.take ?? filters.limit ?? void 0;
    const rawSkip = filters.skip ?? void 0;
    const take = rawTake != null ? Number(rawTake) : void 0;
    const skip = rawSkip != null ? Number(rawSkip) : void 0;
    let orderBy = filters.orderBy || { updatedAt: "desc" };
    if (typeof filters.sort === "string") {
      switch (filters.sort) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        default:
          if (/^[a-zA-Z0-9_]+_(asc|desc)$/.test(filters.sort)) {
            const [field, dir] = filters.sort.split("_");
            orderBy = { [field]: dir };
          }
          break;
      }
    }
    return prisma.meal.findMany({
      where,
      include: { provider: true, category: true },
      take,
      skip,
      orderBy
    });
  },
  findByProvider: async (providerId, opts = {}) => {
    const provider = await prisma.providerProfile.findFirst({
      where: {
        OR: [{ id: providerId }, { userId: providerId }]
      }
    });
    if (!provider) return [];
    const where = { ...opts.where || {}, providerProfileId: provider.id };
    return prisma.meal.findMany({
      where,
      include: { provider: true, category: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy
    });
  },
  findById: (id) => prisma.meal.findUnique({
    where: { id },
    include: { provider: true, category: true }
  }),
  create: async (data) => {
    if (data?.userId) {
      const provider = await prisma.providerProfile.findFirst({
        where: { userId: data.userId }
      });
      if (!provider) {
        throw new Error("Provider profile not found for given userId");
      }
      data.providerProfileId = provider.id;
      delete data.userId;
    }
    if (!data?.providerProfileId) {
      throw new Error("providerProfileId is required to create a meal");
    }
    return prisma.meal.create({ data });
  },
  count: (where) => prisma.meal.count({ where }),
  update: (id, data) => (async () => {
    if (data?.userId) {
      const provider = await prisma.providerProfile.findFirst({
        where: { userId: data.userId }
      });
      if (!provider) {
        throw new Error("Provider profile not found for given userId");
      }
      data.providerProfileId = provider.id;
      delete data.userId;
    }
    return prisma.meal.update({ where: { id }, data });
  })(),
  delete: (id) => prisma.meal.delete({ where: { id } })
};

// src/modules/meals/meals.service.ts
var cache = {};
var TTL = 30 * 1e3;
var MealsService = {
  list: async (filters) => {
    const key = `meals:${JSON.stringify(filters || {})}`;
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < TTL) return cache[key].data;
    const data = await MealsRepository.find(filters || {});
    cache[key] = { ts: now, data };
    return data;
  },
  listByProvider: async (providerId, query = {}) => {
    const { page, limit, skip, take } = getPagination(query);
    const search = String(query.q || query.search || "").trim();
    const filters = {
      categoryId: query.categoryId,
      isAvailable: query.isAvailable,
      q: search || void 0,
      skip,
      take,
      sort: query.sort || void 0
    };
    const where = { providerProfileId: providerId };
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.isAvailable !== void 0) {
      where.isAvailable = query.isAvailable === "true";
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    const [meals, total] = await Promise.all([
      MealsRepository.findByProvider(providerId, filters),
      MealsRepository.count(where)
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      meals,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },
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
  listByProvider: asyncHandler(async (req, res) => {
    const providerId = String(req.params.providerId);
    const meals = await MealsService.listByProvider(providerId, req.query);
    return success(res, meals);
  }),
  get: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const meal = await MealsService.get(id);
    if (!meal) return fail(res, 404, "Meal not found");
    return success(res, meal);
  }),
  create: asyncHandler(async (req, res) => {
    const data = { ...req.body || {} };
    if (req.user?.id) data.userId = req.user.id;
    const created = await MealsService.create(data);
    return success(res, created, "Meal created");
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const data = { ...req.body || {} };
    if (req.user?.id) data.userId = req.user.id;
    const updated = await MealsService.update(id, data);
    return success(res, updated, "Meal updated");
  }),
  remove: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await MealsService.remove(id);
    return success(res, null, "Meal deleted");
  })
};

// src/modules/meals/meals.routes.ts
var router2 = Router2();
router2.get("/", MealsController.list);
router2.get(
  "/provider/:providerId",
  authorize_middleware_default("PROVIDER" /* PROVIDER */),
  MealsController.listByProvider
);
router2.get("/:id", MealsController.get);
router2.post("/", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.create);
router2.put("/:id", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.update);
router2.delete("/:id", authorize_middleware_default("PROVIDER" /* PROVIDER */), MealsController.remove);

// src/modules/orders/orders.routes.ts
import { Router as Router3 } from "express";

// src/modules/orders/orders.repository.ts
var OrdersRepository = {
  create: (data) => prisma.order.create({ data }),
  findById: (id) => prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { meal: true } },
      customer: {
        select: { id: true, name: true, email: true }
      },
      provider: {
        select: { id: true, name: true, email: true }
      }
    }
  }),
  findByProvider: (providerId, opts = {}) => {
    const where = { ...opts.where || {}, providerProfileId: providerId };
    return prisma.order.findMany({
      where,
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy
    });
  },
  findByAdmin: (opts = {}) => {
    return prisma.order.findMany({
      where: opts.where,
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true }
        },
        provider: {
          select: { id: true, name: true, email: true }
        }
      },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy
    });
  },
  findByCustomer: (customerId) => prisma.order.findMany({
    where: customerId ? { customerId } : {},
    include: {
      items: { include: { meal: true } },
      customer: {
        select: { id: true, name: true, email: true }
      },
      provider: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { placedAt: "desc" }
  }),
  updateStatus: (id, status) => prisma.order.update({ where: { id }, data: { status } }),
  delete: (id) => prisma.order.delete({ where: { id } }),
  count: (where) => prisma.order.count({ where })
};

// src/modules/orders/orders.service.ts
var OrdersService = {
  create: (data) => OrdersRepository.create(data),
  get: (id) => OrdersRepository.findById(id),
  list: (customerId) => OrdersRepository.findByCustomer(customerId),
  listByProvider: async (providerId, query = {}) => {
    const { page, limit, skip, take } = getPagination(query);
    const q = String(query.q || query.search || "").trim();
    const where = { providerProfileId: providerId };
    if (query.status) {
      where.status = query.status;
    }
    if (q) {
      where.deliveryAddress = { contains: q, mode: "insensitive" };
    }
    const opts = {
      where,
      skip,
      take,
      orderBy: { placedAt: "desc" }
    };
    const [orders, total] = await Promise.all([
      OrdersRepository.findByProvider(providerId, opts),
      OrdersRepository.count(where)
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },
  listByAdmin: async (query = {}) => {
    const { page, limit, skip, take } = getPagination(query);
    const q = String(query.q || query.search || "").trim();
    const where = {};
    if (query.status) {
      where.status = query.status;
    }
    if (q) {
      where.deliveryAddress = { contains: q, mode: "insensitive" };
    }
    const opts = {
      where,
      skip,
      take,
      orderBy: { placedAt: "desc" }
    };
    const [orders, total] = await Promise.all([
      OrdersRepository.findByAdmin(opts),
      OrdersRepository.count(where)
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },
  updateStatus: (id, status) => OrdersRepository.updateStatus(id, status),
  delete: (id) => OrdersRepository.delete(id)
};

// src/modules/orders/orders.controller.ts
var OrdersController = {
  create: asyncHandler(async (req, res) => {
    const { customerId, providerProfileId, deliveryAddress, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return fail(res, 400, "No items provided");
    }
    const mealIds = items.map((i) => i.mealId).filter(Boolean);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds } }
    });
    const mealMap = {};
    meals.forEach((m) => mealMap[m.id] = m);
    const orderItems = items.map((it) => {
      const meal = mealMap[it.mealId];
      const unitPrice = meal ? meal.price : it.unitPrice || 0;
      const quantity = it.quantity || 1;
      return {
        mealId: it.mealId,
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
  listByProvider: asyncHandler(async (req, res) => {
    const providerId = String(req.params.providerId);
    const orders = await OrdersService.listByProvider(providerId, req.query);
    return success(res, orders);
  }),
  listByAdmin: asyncHandler(async (req, res) => {
    const orders = await OrdersService.listByAdmin(req.query);
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
  }),
  delete: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await OrdersService.delete(id);
    return success(res, null, "Order deleted");
  })
};

// src/modules/orders/orders.routes.ts
var router3 = Router3();
router3.post("/", authorize_middleware_default("CUSTOMER" /* CUSTOMER */), OrdersController.create);
router3.get(
  "/provider/:providerId",
  authorize_middleware_default("PROVIDER" /* PROVIDER */),
  OrdersController.listByProvider
);
router3.get("/admin", authorize_middleware_default("ADMIN" /* ADMIN */), OrdersController.listByAdmin);
router3.get("/", authorize_middleware_default(), OrdersController.list);
router3.get("/:id", authorize_middleware_default(), OrdersController.get);
router3.patch("/:id", authorize_middleware_default(), OrdersController.updateStatus);
router3.delete("/:id", authorize_middleware_default(), OrdersController.delete);

// src/modules/providers/providers.routes.ts
import { Router as Router4 } from "express";

// src/modules/providers/providers.repository.ts
var ProvidersRepository = {
  findMany: (opts = {}) => prisma.providerProfile.findMany({
    where: { ...opts.where || {}, isActive: true },
    skip: opts.skip,
    take: opts.take,
    orderBy: opts.orderBy
  }),
  findById: (id) => prisma.providerProfile.findUnique({
    where: { id },
    include: { meals: true }
  }),
  findByUserId: (userId) => {
    const provider = prisma.providerProfile.findUnique({
      where: { userId },
      include: { meals: true }
    });
    if (!provider) {
      throw new Error("Provider profile not found for the given user ID");
    }
    return provider;
  },
  create: (data) => prisma.providerProfile.create({ data }),
  update: (id, data) => prisma.providerProfile.update({ where: { id }, data })
};

// src/modules/providers/providers.service.ts
var cache2 = {};
var TTL2 = 30 * 1e3;
var ProvidersService = {
  list: async (opts = {}) => {
    const key = `providers:${JSON.stringify(opts || {})}`;
    const now = Date.now();
    if (cache2[key] && now - cache2[key].ts < TTL2) return cache2[key].data;
    const data = await ProvidersRepository.findMany(opts);
    cache2[key] = { ts: now, data };
    return data;
  },
  get: (id) => ProvidersRepository.findById(id),
  getByUserId: (userId) => ProvidersRepository.findByUserId(userId),
  create: (data) => ProvidersRepository.create(data),
  update: (id, data) => ProvidersRepository.update(id, data)
};

// src/modules/providers/providers.controller.ts
var ProvidersController = {
  list: asyncHandler(async (req, res) => {
    const query = req.query;
    const { skip, take } = getPagination(query);
    const opts = { skip, take };
    const search = String(query.search || "").trim();
    if (search) {
      opts.where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      };
    }
    const sort = String(query.sort || "").trim();
    if (sort) {
      switch (sort) {
        case "newest":
          opts.orderBy = { createdAt: "desc" };
          break;
        default:
          if (/^[a-zA-Z0-9_]+_(asc|desc)$/.test(sort)) {
            const [field, dir] = sort.split("_");
            opts.orderBy = { [field]: dir };
          }
          break;
      }
    }
    const providers = await ProvidersService.list(opts);
    return success(res, providers);
  }),
  get: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const provider = await ProvidersService.get(id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  }),
  getMe: asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");
    const provider = await ProvidersService.getByUserId(user.id);
    if (!provider) return fail(res, 404, "Provider not found");
    return success(res, provider);
  }),
  create: asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");
    const data = { ...req.body || {}, userId: user.id };
    const existing = await ProvidersService.getByUserId(user.id);
    if (existing) {
      return fail(res, 409, "Provider profile already exists for user");
    }
    const created = await ProvidersService.create(data);
    return success(res, created, "Provider created");
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");
    const existing = await ProvidersService.get(id);
    if (!existing) return fail(res, 404, "Provider not found");
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return fail(res, 403, "Forbidden");
    }
    const updated = await ProvidersService.update(id, req.body);
    return success(res, updated, "Provider updated");
  })
};

// src/modules/providers/providers.routes.ts
var router4 = Router4();
router4.get("/", ProvidersController.list);
router4.get("/me", authorize_middleware_default(), ProvidersController.getMe);
router4.get("/:id", ProvidersController.get);
router4.post("/", authorize_middleware_default(), ProvidersController.create);
router4.put("/:id", authorize_middleware_default(), ProvidersController.update);

// src/modules/reviews/reviews.routes.ts
import { Router as Router5 } from "express";

// src/modules/reviews/reviews.repository.ts
var ReviewsRepository = {
  create: (data) => prisma.review.create({ data }),
  findByMeal: (mealId) => prisma.review.findMany({
    where: { mealId },
    include: { customer: { select: { id: true, name: true } } }
  }),
  findByMealAndCustomer: (mealId, customerId) => prisma.review.findFirst({ where: { mealId, customerId } }),
  findRecent: (limit = 5) => prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      customer: { select: { id: true, name: true } },
      meal: { select: { id: true, title: true } }
    }
  })
};

// src/modules/reviews/reviews.service.ts
var ReviewsService = {
  create: async (data) => {
    const existing = await ReviewsRepository.findByMealAndCustomer(
      data.mealId,
      data.customerId
    );
    if (existing) {
      const err = new Error("You have already reviewed this meal");
      err.status = 400;
      throw err;
    }
    return ReviewsRepository.create(data);
  },
  listByMeal: (mealId) => ReviewsRepository.findByMeal(mealId),
  listRecent: (limit = 5) => ReviewsRepository.findRecent(limit)
};

// src/modules/reviews/reviews.controller.ts
var ReviewsController = {
  create: asyncHandler(async (req, res) => {
    const { mealId, customerId, rating, comment } = req.body;
    if (!mealId || !rating) return fail(res, 400, "mealId and rating required");
    const created = await ReviewsService.create({
      mealId,
      customerId: customerId || null,
      rating,
      comment
    });
    return success(res, created, "Review created");
  }),
  listByMeal: asyncHandler(async (req, res) => {
    const mealId = String(req.params.mealId);
    const reviews = await ReviewsService.listByMeal(mealId);
    return success(res, reviews);
  }),
  listRecent: asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 5);
    const reviews = await ReviewsService.listRecent(limit);
    return success(res, reviews);
  })
};

// src/modules/reviews/reviews.routes.ts
var router5 = Router5();
router5.post("/", authorize_middleware_default("CUSTOMER" /* CUSTOMER */), ReviewsController.create);
router5.get("/meal/:mealId", ReviewsController.listByMeal);
router5.get("/recent", ReviewsController.listRecent);

// src/modules/users/users.routes.ts
import { Router as Router6 } from "express";

// src/modules/users/users.repository.ts
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

// src/modules/users/users.service.ts
var UsersService = {
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

// src/modules/users/users.controller.ts
var UsersController = {
  list: asyncHandler(async (req, res) => {
    const users = await UsersService.list(req.query);
    return success(res, users);
  }),
  update: asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (req.user && req.user.id === id && req.body?.role && req.body.role !== req.user.role) {
      return res.status(400).json({ success: false, message: "You cannot change your own role" });
    }
    const updated = await UsersService.update(id, req.body);
    return success(res, updated, "User updated");
  })
};

// src/modules/users/users.routes.ts
var router6 = Router6();
router6.get("/admin", authorize_middleware_default("ADMIN" /* ADMIN */), UsersController.list);
router6.patch("/admin/:id", authorize_middleware_default("ADMIN" /* ADMIN */), UsersController.update);

// src/routes/index.ts
var router7 = Router7();
var v1 = Router7();
v1.use("/meals", router2);
v1.use("/providers", router4);
v1.use("/orders", router3);
v1.use("/reviews", router5);
v1.use("/users", router6);
v1.use("/categories", router);
router7.use("/v1", v1);
var apiRoutes = router7;

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
    title: "Food Hub API",
    description: "Backend API for Food Hub \u2014 manage meals, providers, orders, and reviews.",
    version: "1.0.0",
    docs: "https://github.com/tariqul420/food-hub-backend"
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
