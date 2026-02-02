import { ProvidersRepository } from "./providers.repository";

export const ProvidersService = {
  list: () => ProvidersRepository.findMany(),
  get: (id: string) => ProvidersRepository.findById(id),
  getByUserId: (userId: string) => ProvidersRepository.findByUserId(userId),
  create: (data: any) => ProvidersRepository.create(data),
  update: (id: string, data: any) => ProvidersRepository.update(id, data),
};
