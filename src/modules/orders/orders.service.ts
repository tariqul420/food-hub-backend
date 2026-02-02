import { getPagination } from "../../shared/utils/pagination";
import { OrdersRepository } from "./orders.repository";

export const OrdersService = {
  create: (data: any) => OrdersRepository.create(data),
  get: (id: string) => OrdersRepository.findById(id),
  list: (customerId?: string) => OrdersRepository.findByCustomer(customerId),
  listByProvider: async (providerId: string, query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const q = String(query.q || query.search || "").trim();

    const where: any = { providerProfileId: providerId };
    if (query.status) {
      where.status = query.status;
    }
    if (q) {
      where.deliveryAddress = { contains: q, mode: "insensitive" };
    }

    const opts: any = {
      where,
      skip,
      take,
      orderBy: { placedAt: "desc" },
    };

    const [orders, total] = await Promise.all([
      OrdersRepository.findByProvider(providerId, opts),
      OrdersRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
  listByAdmin: async (query: any = {}) => {
    const { page, limit, skip, take } = getPagination(query);

    const q = String(query.q || query.search || "").trim();

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (q) {
      where.deliveryAddress = { contains: q, mode: "insensitive" };
    }

    const opts: any = {
      where,
      skip,
      take,
      orderBy: { placedAt: "desc" },
    };

    const [orders, total] = await Promise.all([
      OrdersRepository.findByAdmin(opts),
      OrdersRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
  updateStatus: (id: string, status: any) =>
    OrdersRepository.updateStatus(id, status),
};
