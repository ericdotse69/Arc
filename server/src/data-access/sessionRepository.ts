import { prisma, Session, CreateSessionInput, UpdateSessionInput } from '../models/types';

export const SessionRepository = {
  async create(input: CreateSessionInput): Promise<Session> {
    const session = await prisma.session.create({
      data: {
        userId: input.userId,
        startTime: input.startTime,
        category: input.category,
        status: 'completed',
        ...(input.taskId && { taskId: input.taskId }),
      },
    });
    return session as Session;
  },

  async findById(id: number): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { id },
    });
    return session as Session | null;
  },

  async findByUserId(userId: number): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return sessions as Session[];
  },

  async update(id: number, input: UpdateSessionInput & { flowScore?: number | null; distractions?: number }): Promise<Session> {
    const session = await prisma.session.update({
      where: { id },
      data: {
        endTime: input.endTime,
        totalDuration: input.totalDuration,
        status: input.status,
        cognitiveLoad: input.cognitiveLoad,
        flowScore: input.flowScore,
        distractions: input.distractions || 0,
        ...(input.category && { category: input.category }),
        ...(input.taskId !== undefined && { taskId: input.taskId }),
      },
    });
    return session as Session;
  },

  async delete(id: number): Promise<void> {
    await prisma.session.delete({
      where: { id },
    });
  },
};
