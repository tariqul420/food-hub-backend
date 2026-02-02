import { getPagination } from "../../shared/utils/pagination";
import { CategoriesRepository } from "./categories.repository";

export const CategoriesService = {
  list: async (query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const search = String(query.search || "").trim();

    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }],
        }
      : {};

    const [users, total] = await Promise.all([
      CategoriesRepository.find({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
      }),
      CategoriesRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
};
