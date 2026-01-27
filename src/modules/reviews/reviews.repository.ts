import { prisma } from "../../database/prisma";

export const ReviewsRepository = {
  create: (data: any) => prisma.review.create({ data }),
  findByMeal: (mealId: string) => prisma.review.findMany({ where: { mealId } }),
};
