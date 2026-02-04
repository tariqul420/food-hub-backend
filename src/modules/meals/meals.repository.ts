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
  findByProvider: async (
    providerId: string,
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) => {
    const provider = await prisma.providerProfile.findFirst({
      where: {
        OR: [{ id: providerId }, { userId: providerId }],
      },
    });

    if (!provider) return [];

    const where = { ...(opts.where || {}), providerProfileId: provider.id };
    return prisma.meal.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findById: (id: string) => prisma.meal.findUnique({ where: { id } }),
  create: async (data: any) => {
    if (data?.userId) {
      const provider = await prisma.providerProfile.findFirst({
        where: { userId: data.userId },
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
  count: (where?: any) => prisma.meal.count({ where }),
  update: (id: string, data: any) =>
    (async () => {
      if (data?.userId) {
        const provider = await prisma.providerProfile.findFirst({
          where: { userId: data.userId },
        });
        if (!provider) {
          throw new Error("Provider profile not found for given userId");
        }
        data.providerProfileId = provider.id;
        delete data.userId;
      }

      return prisma.meal.update({ where: { id }, data });
    })(),
  delete: (id: string) => prisma.meal.delete({ where: { id } }),
};
