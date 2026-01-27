import { ReviewsRepository } from "./reviews.repository";

export const ReviewsService = {
  create: (data: any) => ReviewsRepository.create(data),
  listByMeal: (mealId: string) => ReviewsRepository.findByMeal(mealId),
};
