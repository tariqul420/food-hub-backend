import { prisma } from "../../database/prisma";

export const MealsRepository = {
  find: (filters: any) => {
    const where: any = {};
    if (filters.providerProfileId) {
      where.providerProfileId = filters.providerProfileId;
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable === "true";
    }
    if (filters.q) where.title = { contains: filters.q, mode: "insensitive" };
    return prisma.meal.findMany({ where });
  },
  findByProvider: (
    providerId: string,
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) => {
    const where = { ...(opts.where || {}), providerProfileId: providerId };
    return prisma.meal.findMany({
      where,
      include: { provider: true, category: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findById: (id: string) => prisma.meal.findUnique({ where: { id } }),
  create: (data: any) => prisma.meal.create({ data }),
  count: (where?: any) => prisma.meal.count({ where }),
  update: (id: string, data: any) =>
    prisma.meal.update({ where: { id }, data }),
  delete: (id: string) => prisma.meal.delete({ where: { id } }),
};
