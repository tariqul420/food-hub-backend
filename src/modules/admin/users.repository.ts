import { prisma } from "../../database/prisma";

export const UsersRepository = {
  find: (opts: { where?: any; skip?: number; take?: number; orderBy?: any }) =>
    prisma.user.findMany({
      where: opts.where,
      include: { providerProfile: true },
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy,
    }),
  count: (where?: any) => prisma.user.count({ where }),
  update: (id: string, data: any) =>
    prisma.user.update({ where: { id }, data }),
};
