// when VITE_API_URL is provided (e.g. production build) use it,
// but during development always use a relative path so the Vite proxy works.
const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.DEV
  ? ''
  : ENV_API_URL
  ? ENV_API_URL.replace(/\/?$/, '')
  : '';

const buildUrl = (path: string): string => (API_URL ? `${API_URL}${path}` : path);

// debug info
console.debug('tasksAPI ENV_API_URL=', ENV_API_URL, 'API_URL=', API_URL);

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

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
}

export const tasksAPI = {
  async getUserTasks(): Promise<Task[]> {
    const url = buildUrl('/api/tasks');
    console.debug('Fetching user tasks from', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data || [];
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const url = buildUrl('/api/tasks');
    console.debug('Creating task', payload, 'at', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    try {
      const data = await handleResponse(response);
      if (!data.success) {
        throw new Error(data.error || 'Failed to create task');
      }
      return data.data;
    } catch (err) {
      // log raw text for debugging
      const text = await response.text().catch(() => '<<could not read>>');
      console.error('createTask response text:', text);
      throw err;
    }
  },

  async updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(response);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update task');
    }
    return data.data;
  },

  async deleteTask(taskId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`Failed to delete task (HTTP ${response.status})`);
      }
    }
  },
};
