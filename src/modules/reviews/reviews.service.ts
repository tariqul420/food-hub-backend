import { ReviewsRepository } from "./reviews.repository";

export const ReviewsService = {
  create: async (data: any) => {
    // prevent duplicate review by same customer for a meal
    const existing = await ReviewsRepository.findByMealAndCustomer(
      data.mealId,
      data.customerId,
    );
    if (existing) {
      const err: any = new Error("You have already reviewed this meal");
      err.status = 400;
      throw err;
    }
    return ReviewsRepository.create(data);
  },
  listByMeal: (mealId: string) => ReviewsRepository.findByMeal(mealId),
  listRecent: (limit = 5) => ReviewsRepository.findRecent(limit),
};
