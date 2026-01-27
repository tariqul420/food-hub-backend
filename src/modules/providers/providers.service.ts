import { ProvidersRepository } from "./providers.repository";

export const ProvidersService = {
  list: () => ProvidersRepository.findMany(),
  get: (id: string) => ProvidersRepository.findById(id),
};
