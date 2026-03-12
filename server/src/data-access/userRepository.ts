import { prisma, User } from '../models/types';

export const UserRepository = {
  async create(email: string, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  },

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },
};
