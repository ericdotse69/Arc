import { prisma, Session } from '../models/types';

interface TaskBreakdown {
  taskId: number | null;
  taskTitle: string;
  duration: number;
  count: number;
}

interface SessionStats {
  totalHours: number;
  averageCognitiveLoad: number;
  averageFlowScore: number;
  totalSessions: number;
  peakHour: number | null; // Hour of day (0-23) when user is most productive
  categoryBreakdown: Array<{ category: string; duration: number; count: number }>;
  taskBreakdown: TaskBreakdown[];
  sessionsLast7Days: Array<{
    date: string;
    duration: number;
    count: number;
    avgCognitiveLoad: number;
    avgFlowScore: number;
  }>;
}

export const StatsService = {
  async getWeeklyStats(userId: number): Promise<SessionStats> {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all sessions for the user in the last 7 days
    const sessions = (await prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
        status: 'completed',
      },
      orderBy: {
        createdAt: 'asc',
      },
    })) as Session[]; // cast to our Session type for convenience

    // Calculate totals
    const totalSeconds = sessions.reduce((sum, session) => sum + (session.totalDuration || 0), 0);
    const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;

    // Calculate average cognitive load
    const completedSessions = sessions.filter((s) => s.cognitiveLoad !== null);
    const averageCognitiveLoad =
      completedSessions.length > 0
        ? Math.round(
            (completedSessions.reduce((sum, s) => sum + (s.cognitiveLoad || 0), 0) /
              completedSessions.length) *
              10
          ) / 10
        : 0;

    // Calculate average flow score
    const sessionsWithFlowScore = sessions.filter((s) => s.flowScore !== null);
    const averageFlowScore =
      sessionsWithFlowScore.length > 0
        ? Math.round(
            (sessionsWithFlowScore.reduce((sum, s) => sum + (s.flowScore || 0), 0) /
              sessionsWithFlowScore.length) *
              10
          ) / 10
        : 0;

    // Group by date
    const sessionsByDate: {
      [key: string]: {
        duration: number;
        count: number;
        cognitiveLoads: number[];
        flowScores: number[];
      };
    } = {};

    sessions.forEach((session) => {
      const dateString = session.createdAt.toISOString().split('T')[0];

      if (!sessionsByDate[dateString]) {
        sessionsByDate[dateString] = {
          duration: 0,
          count: 0,
          cognitiveLoads: [],
          flowScores: [],
        };
      }

      sessionsByDate[dateString].duration += session.totalDuration || 0;
      sessionsByDate[dateString].count += 1;
      if (session.cognitiveLoad) {
        sessionsByDate[dateString].cognitiveLoads.push(session.cognitiveLoad);
      }
      if (session.flowScore !== null) {
        sessionsByDate[dateString].flowScores.push(session.flowScore);
      }
    });

    // Convert to array format for charting
    const sessionsLast7Days = Object.entries(sessionsByDate).map(([date, data]) => ({
      date,
      duration: Math.round(data.duration / 60), // Convert to minutes for display
      count: data.count,
      avgCognitiveLoad:
        data.cognitiveLoads.length > 0
          ? Math.round(
              (data.cognitiveLoads.reduce((a, b) => a + b, 0) / data.cognitiveLoads.length) * 10
            ) / 10
          : 0,
      avgFlowScore:
        data.flowScores.length > 0
          ? Math.round(
              (data.flowScores.reduce((a, b) => a + b, 0) / data.flowScores.length) * 10
            ) / 10
          : 0,
    }));

    // Calculate peak hour (hour of day when user has most sessions)
    const hourCounts: { [key: number]: number } = {};

    // Also aggregate by category
    const categoryMap: { [key: string]: { duration: number; count: number } } = {};

    sessions.forEach((session) => {
      const hour = session.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;

      const cat = session.category || 'Unspecified';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { duration: 0, count: 0 };
      }
      categoryMap[cat].duration += session.totalDuration || 0;
      categoryMap[cat].count += 1;
    });

    let peakHour: number | null = null;
    if (Object.keys(hourCounts).length > 0) {
      const peakEntry = Object.entries(hourCounts).reduce<
        { hour: number; count: number } | null
      >((acc, [hour, count]) => {
        if (acc === null || count > acc.count) {
          return { hour: Number(hour), count };
        }
        return acc;
      }, null);
      if (peakEntry) {
        peakHour = peakEntry.hour;
      }
    }

    // Convert categoryMap to array for returning
    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      duration: Math.round(data.duration / 60), // minutes
      count: data.count,
    }));

    // Aggregate by task to show time per task
    const taskMap: { [key: number]: { title: string; duration: number; count: number } } = {};
    const unloggedSessions = { duration: 0, count: 0 };

    // Get all tasks for this user to map IDs to titles
    const allTasks = await prisma.task.findMany({
      where: { userId },
    });

    const taskTitleMap: { [key: number]: string } = {};
    allTasks.forEach((task) => {
      taskTitleMap[task.id] = task.title;
    });

    sessions.forEach((session) => {
      if (session.taskId) {
        const taskId = session.taskId;
        const taskTitle = taskTitleMap[taskId] || `Task #${taskId}`;

        if (!taskMap[taskId]) {
          taskMap[taskId] = { title: taskTitle, duration: 0, count: 0 };
        }
        taskMap[taskId].duration += session.totalDuration || 0;
        taskMap[taskId].count += 1;
      } else {
        unloggedSessions.duration += session.totalDuration || 0;
        unloggedSessions.count += 1;
      }
    });

    // Convert taskMap to array for returning, sorted by duration (descending)
    const taskBreakdown: Array<{
      taskId: number | null;
      taskTitle: string;
      duration: number;
      count: number;
    }> = Object.entries(taskMap)
      .map(([taskId, data]) => ({
        taskId: Number(taskId),
        taskTitle: data.title,
        duration: Math.round(data.duration / 60), // minutes
        count: data.count,
      }))
      .sort((a, b) => b.duration - a.duration);

    // Add "Unlogged" entry if there are sessions without tasks
    if (unloggedSessions.count > 0) {
      taskBreakdown.push({
        taskId: null,
        taskTitle: 'Unlogged',
        duration: Math.round(unloggedSessions.duration / 60),
        count: unloggedSessions.count,
      });
    }

    return {
      totalHours,
      averageCognitiveLoad,
      averageFlowScore,
      totalSessions: sessions.length,
      peakHour,
      categoryBreakdown,
      taskBreakdown,
      sessionsLast7Days,
    };
  },
};
