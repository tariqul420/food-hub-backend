import { prisma } from "../../database/prisma";

export const OrdersRepository = {
  create: (data: any) => prisma.order.create({ data, include: { items: true } }),
  findById: (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),
  findByCustomer: (customerId?: string) =>
    prisma.order.findMany({ where: customerId ? { customerId } : {}, include: { items: true } }),
  updateStatus: (id: string, status: any) => prisma.order.update({ where: { id }, data: { status } }),
};
