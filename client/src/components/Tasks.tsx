import { useEffect, useState } from 'react';
import { tasksAPI, Task, CreateTaskPayload } from '../api/tasksAPI';

export function Tasks(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const list = await tasksAPI.getUserTasks();
      setTasks(list);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError('Could not load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CreateTaskPayload = { title: newTitle.trim(), description: newDesc.trim() || undefined };
      await tasksAPI.createTask(payload);
      setNewTitle('');
      setNewDesc('');
      await loadTasks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await tasksAPI.updateTask(task.id, { completed: !task.completed });
      await loadTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#fafafa] mb-4">Your Tasks</h2>
      {error && (
        <div className="border-[1px] border-[#dc2626] bg-[#09090b] p-4 mb-4">
          <p className="text-[#dc2626] text-sm">{error}</p>
        </div>
      )}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-2 border-[1px] border-[#52525b] bg-[#09090b] text-[#fafafa] p-2 focus:outline-none"
        />
        <textarea
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full mb-2 border-[1px] border-[#52525b] bg-[#09090b] text-[#fafafa] p-2 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-[#dc2626] text-[#09090b] px-4 py-2 font-bold uppercase text-sm tracking-[0.1em] hover:bg-[#b91c1c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Add Task'}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-[#52525b]">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between border-[1px] border-[#52525b] p-2 bg-[#09090b]"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                  className="accent-[#dc2626]"
                />
                <div>
                  <p className="text-[#fafafa] font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-[#52525b] text-xs">{task.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-[#dc2626] hover:text-[#f87171]"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
