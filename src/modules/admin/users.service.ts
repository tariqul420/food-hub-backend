import { UsersRepository } from "./users.repository";

export const AdminUsersService = {
  list: () => UsersRepository.findMany(),
  update: (id: string, data: any) => UsersRepository.update(id, data),
};
