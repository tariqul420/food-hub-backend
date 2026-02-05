import { prisma } from "../../database/prisma";

export const ReviewsRepository = {
  create: (data: any) => prisma.review.create({ data }),
  findByMeal: (mealId: string) =>
    prisma.review.findMany({
      where: { mealId },
      include: { customer: { select: { id: true, name: true } } },
    }),
  findByMealAndCustomer: (mealId: string, customerId?: string | null) =>
    prisma.review.findFirst({ where: { mealId, customerId } }),
  findRecent: (limit = 5) =>
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        customer: { select: { id: true, name: true } },
        meal: { select: { id: true, title: true } },
      },
    }),
};
