import { prisma } from "../../database/prisma";

export const ProvidersRepository = {
  findMany: () =>
    prisma.providerProfile.findMany({ where: { isActive: true } }),
  findById: (id: string) =>
    prisma.providerProfile.findUnique({
      where: { id },
      include: { meals: true },
    }),
  findByUserId: (userId: string) =>
    prisma.providerProfile.findUnique({
      where: { userId },
      include: { meals: true },
    }),
  create: (data: any) => prisma.providerProfile.create({ data }),
  update: (id: string, data: any) =>
    prisma.providerProfile.update({ where: { id }, data }),
};
