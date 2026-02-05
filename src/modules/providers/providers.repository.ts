import { prisma } from "../../database/prisma";

export const ProvidersRepository = {
  findMany: (
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) =>
    prisma.providerProfile.findMany({
      where: { ...(opts.where || {}), isActive: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    }),
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
