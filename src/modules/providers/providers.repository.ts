import { prisma } from "../../database/prisma";

export const ProvidersRepository = {
  findMany: () =>
    prisma.providerProfile.findMany({ where: { isActive: true } }),
  findById: (id: string) =>
    prisma.providerProfile.findUnique({
      where: { id },
      include: { meals: true },
    }),
  findByUserId: (userId: string) => {
    const provider = prisma.providerProfile.findUnique({
      where: { userId },
      include: { meals: true },
    });
    if (!provider) {
      throw new Error("Provider profile not found for the given user ID");
    }
    return provider;
  },
  create: (data: any) => prisma.providerProfile.create({ data }),
  update: (id: string, data: any) =>
    prisma.providerProfile.update({ where: { id }, data }),
};
