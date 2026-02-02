import { prisma } from "../../database/prisma";

export const CategoriesRepository = {
  find: (opts: { where?: any; skip?: number; take?: number; orderBy?: any }) =>
    prisma.category.findMany({
      where: opts.where,
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    }),
  count: (where?: any) => prisma.category.count({ where }),
};
