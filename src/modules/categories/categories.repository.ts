import { prisma } from "../../database/prisma";

export const CategoriesRepository = {
  findByAdmin: (opts: {
    where?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }) =>
    prisma.category.findMany({
      where: opts.where,
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    }),
  count: (where?: any) => prisma.category.count({ where }),
  findById: (id: string) => prisma.category.findUnique({ where: { id } }),
  create: (data: any) => prisma.category.create({ data }),
  update: (id: string, data: any) =>
    prisma.category.update({ where: { id }, data }),
  delete: (id: string) => prisma.category.delete({ where: { id } }),
};
