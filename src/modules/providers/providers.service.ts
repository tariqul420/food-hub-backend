import { ProvidersRepository } from "./providers.repository";

const cache: Record<string, { ts: number; data: any }> = {};
const TTL = 30 * 1000; // 30s

export const ProvidersService = {
  list: async (opts: any = {}) => {
    const key = `providers:${JSON.stringify(opts || {})}`;
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < TTL) return cache[key].data;
    const data = await ProvidersRepository.findMany(opts);
    cache[key] = { ts: now, data };
    return data;
  },
  get: (id: string) => ProvidersRepository.findById(id),
  getByUserId: (userId: string) => ProvidersRepository.findByUserId(userId),
  create: (data: any) => ProvidersRepository.create(data),
  update: (id: string, data: any) => ProvidersRepository.update(id, data),
};
