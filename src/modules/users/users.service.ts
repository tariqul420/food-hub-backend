import { getPagination } from "../../shared/utils/pagination";
import { UsersRepository } from "./users.repository";

export const UsersService = {
  list: async (query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const search = String(query.search || "").trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      UsersRepository.find({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
      }),
      UsersRepository.count(where),
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

  update: (id: string, data: any) => UsersRepository.update(id, data),
};
