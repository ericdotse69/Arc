import { prisma, Task, CreateTaskInput, UpdateTaskInput } from '../models/types';

export const TaskRepository = {
  async create(input: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        userId: input.userId,
        title: input.title,
        description: input.description,
      },
    });
    return task as Task;
  },

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks as Task[];
  },

  async update(id: number, input: UpdateTaskInput): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: input,
    });
    return task as Task;
  },

  async delete(id: number): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  },
};
