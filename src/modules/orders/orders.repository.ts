import { prisma } from "../../database/prisma";

export const OrdersRepository = {
  create: (data: any) =>
    prisma.order.create({ data, include: { items: true } }),
  findById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
  findByProvider: (
    providerId: string,
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) => {
    const where = { ...(opts.where || {}), providerProfileId: providerId };
    return prisma.order.findMany({
      where,
      include: { items: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findByCustomer: (customerId?: string) =>
    prisma.order.findMany({
      where: customerId ? { customerId } : {},
      include: { items: true },
    }),
  updateStatus: (id: string, status: any) =>
    prisma.order.update({ where: { id }, data: { status } }),
  count: (where?: any) => prisma.order.count({ where }),
};
