import { MealsRepository } from "./meals.repository";

export const MealsService = {
  list: (filters: any) => MealsRepository.findMany(filters),
  get: (id: string) => MealsRepository.findById(id),
  create: (data: any) => MealsRepository.create(data),
  update: (id: string, data: any) => MealsRepository.update(id, data),
  remove: (id: string) => MealsRepository.delete(id),
};
