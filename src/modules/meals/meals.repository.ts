import { prisma } from "../../database/prisma";

export const MealsRepository = {
  find: (filters: any = {}) => {
    const where: any = {};

    if (filters.providerProfileId) {
      where.providerProfileId = filters.providerProfileId;
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable === "true";
    }

    const searchTerm = (filters.search ?? filters.q ?? "").toString().trim();
    if (searchTerm) {
      where.title = { contains: searchTerm, mode: "insensitive" };
    }

    const rawTake = filters.take ?? filters.limit ?? undefined;
    const rawSkip = filters.skip ?? undefined;
    const take = rawTake !== null ? Number(rawTake) : undefined;
    const skip = rawSkip !== null ? Number(rawSkip) : undefined;

    let orderBy: any = filters.orderBy || { updatedAt: "desc" };
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
            orderBy = { [field]: dir as "asc" | "desc" };
          }
          break;
      }
    }

    const findOptions: any = {
      where,
      include: { provider: true, category: true },
      orderBy,
    };

    if (typeof take === "number" && !Number.isNaN(take)) {
      findOptions.take = take;
    }
    if (typeof skip === "number" && !Number.isNaN(skip)) {
      findOptions.skip = skip;
    }

    return prisma.meal.findMany(findOptions);
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
      include: { provider: true, category: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findById: (id: string) =>
    prisma.meal.findUnique({
      where: { id },
      include: { provider: true, category: true },
    }),
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
