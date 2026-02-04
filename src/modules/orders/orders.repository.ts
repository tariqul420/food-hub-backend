import { prisma } from "../../database/prisma";

export const OrdersRepository = {
  create: (data: any) => prisma.order.create({ data }),
  findById: (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  findByProvider: (
    providerId: string,
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) => {
    const where = { ...(opts.where || {}), providerProfileId: providerId };
    return prisma.order.findMany({
      where,
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findByAdmin: (
    opts: { where?: any; skip?: number; take?: number; orderBy?: any } = {},
  ) => {
    return prisma.order.findMany({
      where: opts.where,
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    });
  },
  findByCustomer: (customerId?: string) =>
    prisma.order.findMany({
      where: customerId ? { customerId } : {},
      include: {
        items: { include: { meal: true } },
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { placedAt: "desc" },
    }),
  updateStatus: (id: string, status: any) =>
    prisma.order.update({ where: { id }, data: { status } }),
  delete: (id: string) => prisma.order.delete({ where: { id } }),
  count: (where?: any) => prisma.order.count({ where }),
};
