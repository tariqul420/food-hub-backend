import { prisma } from "../../database/prisma";

export const MealsRepository = {
  findMany: (filters: any) => {
    const where: any = {};
    if (filters.providerProfileId) where.providerProfileId = filters.providerProfileId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable === 'true';
    if (filters.q) where.title = { contains: filters.q, mode: 'insensitive' };
    return prisma.meal.findMany({ where });
  },

  findById: (id: string) => prisma.meal.findUnique({ where: { id } }),

  create: (data: any) => prisma.meal.create({ data }),

  update: (id: string, data: any) => prisma.meal.update({ where: { id }, data }),

  delete: (id: string) => prisma.meal.delete({ where: { id } }),
};
