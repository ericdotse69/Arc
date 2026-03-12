const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.DEV
  ? ''
  : ENV_API_URL
  ? ENV_API_URL.replace(/\/?$/, '')
  : '';
const buildUrl = (path: string) => (API_URL ? `${API_URL}${path}` : path);

console.debug('sessionsAPI ENV_API_URL=', ENV_API_URL, 'API_URL=', API_URL);

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('arc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(`Failed to process response (HTTP ${response.status})`);
    }
  }
  return response.json();
};

export interface StartSessionPayload {
  category: string;
  taskId?: number;
}

export interface EndSessionPayload {
  sessionId: number;
  endTime: string;
  totalDuration: number;
  status: 'completed' | 'interrupted';
  cognitiveLoad?: number;
  category?: string;
  distractions?: number;
  taskId?: number | null;
}

export interface SessionResponse {
  success: boolean;
  data: {
    id: number;
    userId: number;
    startTime: string;
    endTime: string | null;
    totalDuration: number | null;
    category: string;
    cognitiveLoad: number | null;
    flowScore: number | null;
    distractions: number;
    status: string;
    taskId?: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

export const sessionsAPI = {
  async startSession(payload: StartSessionPayload): Promise<SessionResponse> {
    const response = await fetch(buildUrl('/api/sessions/start'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await handleResponse(response);
    if (!data.success) {
      throw new Error(data.error || 'Failed to start session');
    }
    return data;
  },

  async endSession(payload: EndSessionPayload): Promise<SessionResponse> {
    const response = await fetch(buildUrl('/api/sessions/end'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await handleResponse(response);
    if (!data.success) {
      throw new Error(data.error || 'Failed to end session');
    }
    return data;
  },

  async getUserSessions(): Promise<SessionResponse[]> {
    const response = await fetch(buildUrl('/api/sessions/user/me'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return data.data || [];
  },
};
