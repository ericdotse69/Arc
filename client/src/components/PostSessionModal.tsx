import { useState, useEffect } from 'react';

export interface TelemetryData {
  category: string;
  cognitiveLoad: number;
  distractions: number;
}

interface PostSessionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: (data: TelemetryData) => Promise<void>;
  error?: string | null;
  initialCategory?: string;
  initialTaskTitle?: string;
}

const CATEGORIES = [
  'Data Analysis',
  'Writing',
  'Research',
  'Literature Review',
  'Coding',
  'Problem Solving',
  'Planning',
  'Other',
];

export function PostSessionModal({
  isOpen,
  isLoading,
  onSubmit,
  error,
  initialCategory,
  initialTaskTitle,
}: PostSessionModalProps): JSX.Element | null {
  const [category, setCategory] = useState('Data Analysis');

  // if parent supplies an initial category, use it when modal opens
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);
  const [cognitiveLoad, setCognitiveLoad] = useState(7);
  const [distractions, setDistractions] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!category) {
      setLocalError('Category is required');
      return;
    }

    if (cognitiveLoad < 1 || cognitiveLoad > 10) {
      setLocalError('Cognitive load must be between 1 and 10');
      return;
    }

    if (distractions < 0) {
      setLocalError('Distractions cannot be negative');
      return;
    }

    try {
      await onSubmit({
        category,
        cognitiveLoad,
        distractions,
      });
      // Reset form after successful submission
      setCategory('Data Analysis');
      setCognitiveLoad(7);
      setDistractions(0);
      setLocalError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to log session';
      setLocalError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-8">
      <div className="w-full max-w-md border-[2px] border-[#52525b] bg-[#09090b] p-8">
        <h2 className="text-2xl font-bold text-[#fafafa] mb-6 uppercase tracking-[0.05em]">
          Log Session
        </h2>

        {(error || localError) && (
          <div className="border-[1px] border-[#dc2626] bg-[#09090b] p-4 mb-6">
            <p className="text-[#dc2626] text-sm font-bold">⚠ {error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display selected task if any */}
          {initialTaskTitle && (
            <div>
              <label className="block text-xs uppercase font-bold tracking-[0.1em] text-[#fafafa] mb-3">
                Task
              </label>
              <input
                type="text"
                value={initialTaskTitle}
                disabled
                className="w-full border-[1px] border-[#52525b] bg-[#09090b] text-[#fafafa] p-3 font-mono text-sm"
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-[0.1em] text-[#fafafa] mb-3">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full border-[1px] border-[#52525b] bg-[#09090b] text-[#fafafa] p-3 font-mono text-sm focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cognitive Load (1-10 Selector) */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-[0.1em] text-[#fafafa] mb-3">
              Cognitive Load (1-10)
            </label>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCognitiveLoad(num)}
                  disabled={isLoading}
                  className={`border-[1px] p-2 font-bold text-xs transition-all ${
                    cognitiveLoad === num
                      ? 'border-[#dc2626] bg-[#dc2626] text-[#09090b]'
                      : 'border-[#52525b] text-[#fafafa] hover:border-[#dc2626]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Distractions Input */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-[0.1em] text-[#fafafa] mb-3">
              Times Distracted
            </label>
            <input
              type="number"
              min="0"
              value={distractions}
              onChange={(e) => setDistractions(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={isLoading}
              className="w-full border-[1px] border-[#52525b] bg-[#09090b] text-[#fafafa] p-3 font-mono text-sm focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#dc2626] text-[#09090b] border-[1px] border-[#dc2626] p-3 font-bold uppercase text-sm tracking-[0.1em] hover:bg-[#b91c1c] hover:border-[#b91c1c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging...' : 'Log Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
