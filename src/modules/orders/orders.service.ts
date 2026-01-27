import { OrdersRepository } from "./orders.repository";

export const OrdersService = {
  create: (data: any) => OrdersRepository.create(data),
  get: (id: string) => OrdersRepository.findById(id),
  list: (customerId?: string) => OrdersRepository.findByCustomer(customerId),
  updateStatus: (id: string, status: any) => OrdersRepository.updateStatus(id, status),
};
