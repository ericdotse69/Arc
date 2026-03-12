const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('arc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface SessionDayStats {
  date: string;
  duration: number;
  count: number;
  avgCognitiveLoad: number;
  avgFlowScore: number;
}

export interface TaskBreakdown {
  taskId: number | null;
  taskTitle: string;
  duration: number;
  count: number;
}

export interface WeeklyStats {
  totalHours: number;
  averageCognitiveLoad: number;
  averageFlowScore: number;
  totalSessions: number;
  peakHour: number | null;
  categoryBreakdown: Array<{ category: string; duration: number; count: number }>;
  taskBreakdown: TaskBreakdown[];
  sessionsLast7Days: SessionDayStats[];
}

export const statsAPI = {
  async getWeeklyStats(): Promise<WeeklyStats> {
    const token = localStorage.getItem('arc_token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }

    const response = await fetch(`${API_URL}/api/stats/weekly`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Stats API error response:', response.status, text);
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`Failed to fetch stats (HTTP ${response.status})`);
      }
    }

    const data = await response.json();
    console.log('Stats API response:', data);
    
    if (!data.data) {
      console.warn('No data field in response, returning empty stats');
      return {
        totalHours: 0,
        averageCognitiveLoad: 0,
        averageFlowScore: 0,
        totalSessions: 0,
        sessionsLast7Days: [],
      };
    }
    
    return data.data;
  },
};
