import { prisma } from "../../database/prisma";

export const UsersRepository = {
  findMany: () => prisma.user.findMany({ include: { providerProfile: true } }),
  update: (id: string, data: any) => prisma.user.update({ where: { id }, data }),
};
