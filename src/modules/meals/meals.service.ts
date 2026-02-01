import { getPagination } from "../../shared/utils/pagination";
import { MealsRepository } from "./meals.repository";

export const MealsService = {
  list: (filters: any) => MealsRepository.find(filters),
  listByProvider: async (providerId: string, query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const search = String(query.q || query.search || "").trim();

    const filters: any = {
      categoryId: query.categoryId,
      isAvailable: query.isAvailable,
      q: search || undefined,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    };

    const where: any = { providerProfileId: providerId };
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable === "true";
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [meals, total] = await Promise.all([
      MealsRepository.findByProvider(providerId, filters),
      MealsRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      meals,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
  get: (id: string) => MealsRepository.findById(id),
  create: (data: any) => MealsRepository.create(data),
  update: (id: string, data: any) => MealsRepository.update(id, data),
  remove: (id: string) => MealsRepository.delete(id),
};
