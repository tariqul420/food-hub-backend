import { prisma } from "../../database/prisma";

export const ProvidersRepository = {
  findMany: () => prisma.providerProfile.findMany({ where: { isActive: true } }),
  findById: (id: string) =>
    prisma.providerProfile.findUnique({ where: { id }, include: { meals: true } }),
};
