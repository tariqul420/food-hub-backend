import { getPagination } from "../../shared/utils/pagination";
import { CategoriesRepository } from "./categories.repository";

export const CategoriesService = {
  list: async () => {
    return CategoriesRepository.find();
  },
  listByAdmin: async (query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const search = String(query.search || "").trim();

    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }],
        }
      : {};

    const [categories, total] = await Promise.all([
      CategoriesRepository.findByAdmin({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
      }),
      CategoriesRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
  update: (id: string, data: any) => CategoriesRepository.update(id, data),
  create: (data: any) => CategoriesRepository.create(data),
  remove: (id: string) => CategoriesRepository.delete(id),
};
