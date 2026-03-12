import { useArcTimer } from '../hooks/useArcTimer.ts';
import type { Task } from '../api/tasksAPI';
import { useFocusMode } from '../context/FocusModeContext';
import { PostSessionModal } from './PostSessionModal';
import { useEffect } from 'react';

export function ArcTimer(): JSX.Element {
  const {
    state,
    protocol,
    formattedTime,
    isRunning,
    sessionsCompleted,
    totalFocusTime,
    isLoading,
    error,
    showTelemetryModal,
    start,
    pause,
    reset,
    skip,
    setProtocol,
    setCategory,
    category,
    tasks,
    taskId,
    setTaskId,
    submitTelemetry,
  } = useArcTimer();

  const { setFocusMode } = useFocusMode();

  // Update focus mode when timer state changes
  useEffect(() => {
    const isInDeepFocus = state === 'working' && isRunning;
    setFocusMode(isInDeepFocus);
  }, [state, isRunning, setFocusMode]);

  // Determine current display text and color state
  const getStateLabel = (): string => {
    switch (state) {
      case 'working':
        return 'FOCUS';
      case 'short-break':
        return 'SHORT BREAK';
      case 'long-break':
        return 'LONG BREAK';
      case 'idle':
      default:
        return 'READY';
    }
  };

  // Format total focus time for display
  const formatFocusTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Determine if state is an active session
  const isActiveSession = state === 'working' || state === 'short-break' || state === 'long-break';
  const isFocusing = state === 'working';
  const isInDeepFocus = isFocusing && isRunning;

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-8 py-8">
      {isInDeepFocus ? (
        // Deep Focus Mode - immersive view
        <div className="w-full max-w-2xl text-center">
          <div className="mb-12">
            <span className="text-sm uppercase font-bold tracking-[0.15em] text-[#dc2626]">
              {getStateLabel()}
            </span>
          </div>

          <div
            className="mb-16"
            style={{
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'ui-monospace, SFMono-Regular, Courier New, monospace',
            }}
          >
            <div className="text-9xl font-black tracking-tighter text-[#dc2626]">
              {formattedTime}
            </div>
          </div>

          <button
            onClick={pause}
            className="border-[1px] px-6 py-3 font-bold uppercase text-xs tracking-[0.1em] transition-all border-[#52525b] text-[#fafafa] hover:border-[#dc2626] hover:text-[#dc2626]"
          >
            Pause
          </button>

          <div className="mt-12 border-[1px] border-[#52525b] p-6 bg-[#09090b]">
            <p className="text-[#fafafa] text-sm">Keep your focus. You are in a deep work session.</p>
          </div>
        </div>
      ) : (
        // Standard View - all controls
        <div className="w-full max-w-2xl">
          {/* Protocol Selector */}
          <div className="mb-4 flex justify-center gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold">
                Protocol:
              </span>
              <div className="flex gap-2">
              <button
                onClick={() => setProtocol('standard')}
                disabled={isRunning}
                className={`border-[1px] px-3 py-2 font-bold text-sm transition-all ${
                  protocol === 'standard'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#fafafa] hover:text-[#fafafa]'
                } ${isRunning ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                25
              </button>
              <button
                onClick={() => setProtocol('deep')}
                disabled={isRunning}
                className={`border-[1px] px-3 py-2 font-bold text-sm transition-all ${
                  protocol === 'deep'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#fafafa] hover:text-[#fafafa]'
                } ${isRunning ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                50
              </button>
              <button
                onClick={() => setProtocol('ultradian')}
                disabled={isRunning}
                className={`border-[1px] px-3 py-2 font-bold text-sm transition-all ${
                  protocol === 'ultradian'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#fafafa] hover:text-[#fafafa]'
                } ${isRunning ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                90
              </button>
                </div>
            </div>

            {/* Category selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold">
                Category:
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isRunning}
                className="border-[1px] bg-[#09090b] text-[#fafafa] p-2 text-xs font-mono focus:outline-none focus:border-[#dc2626]"
              >
                {['Data Analysis','Writing','Research','Literature Review','Coding','Problem Solving','Planning','Other'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Task selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold">
                Task:
              </span>
              <select
                value={taskId ?? ''}
                onChange={(e) => setTaskId(e.target.value ? parseInt(e.target.value, 10) : null)}
                disabled={isRunning}
                className="border-[1px] bg-[#09090b] text-[#fafafa] p-2 text-xs font-mono focus:outline-none focus:border-[#dc2626]"
              >
                <option value="">None</option>
                {tasks.map((t: Task) => (
                  <option key={t.id} value={t.id}>
                    {t.title}{t.completed ? ' (done)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="border-[1px] border-[#dc2626] bg-[#09090b] p-4 mb-8">
              <p className="text-[#dc2626] text-sm font-bold">⚠ {error}</p>
            </div>
          )}

          {/* Main timer display */}
          <div className="border-[2px] border-[#52525b] p-12 mb-8 bg-[#09090b]">
            <div className="mb-8 text-center">
              <span className="text-sm uppercase font-bold tracking-[0.15em]">
                {getStateLabel()}
              </span>
            </div>

            <div
              className="text-center mb-12"
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'ui-monospace, SFMono-Regular, Courier New, monospace',
              }}
            >
              <div
                className={`text-9xl font-black tracking-tighter ${
                  isFocusing ? 'text-[#dc2626]' : 'text-[#fafafa]'
                }`}
              >
                {formattedTime}
              </div>
            </div>

            {isLoading && (
              <div className="text-center mb-8">
                <p className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold">
                  Syncing...
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={start}
                disabled={isRunning || isLoading}
                className={`border-[1px] px-6 py-3 font-bold uppercase text-xs tracking-[0.1em] transition-all ${
                  isRunning || isLoading
                    ? 'border-[#52525b] text-[#52525b] cursor-not-allowed'
                    : 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-[#09090b]'
                }`}
              >
                {isLoading ? '...' : 'Start'}
              </button>

              <button
                onClick={pause}
                disabled={!isRunning}
                className={`border-[1px] px-6 py-3 font-bold uppercase text-xs tracking-[0.1em] transition-all ${
                  !isRunning
                    ? 'border-[#52525b] text-[#52525b] cursor-not-allowed'
                    : 'border-[#52525b] text-[#fafafa] hover:border-[#dc2626] hover:text-[#dc2626]'
                }`}
              >
                Pause
              </button>

              <button
                onClick={reset}
                className="border-[1px] border-[#52525b] px-6 py-3 font-bold uppercase text-xs tracking-[0.1em] text-[#fafafa] hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
              >
                Reset
              </button>
            </div>

            <button
              onClick={skip}
              className="w-full border-[1px] border-[#52525b] px-6 py-3 font-bold uppercase text-xs tracking-[0.1em] text-[#fafafa] hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
            >
              Skip to Next
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border-[1px] border-[#52525b] p-6 bg-[#09090b]">
              <p className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold mb-2">
                Sessions
              </p>
              <p className="text-4xl font-black text-[#dc2626]">{sessionsCompleted}</p>
            </div>

            <div className="border-[1px] border-[#52525b] p-6 bg-[#09090b]">
              <p className="text-[#52525b] text-xs uppercase tracking-[0.1em] font-bold mb-2">
                Total Focus
              </p>
              <p className="text-3xl font-black text-[#dc2626]">
                {formatFocusTime(totalFocusTime)}
              </p>
            </div>
          </div>

          {/* Session info */}
          {isActiveSession && (
            <div className="border-[1px] border-[#52525b] p-6 bg-[#09090b]">
              <p className="text-[#fafafa] text-sm">
                {isFocusing
                  ? 'Keep your focus. You are in a deep work session.'
                  : 'Take a moment. Rest is part of the process.'}
              </p>
            </div>
          )}
        </div>
      )}

      <PostSessionModal
        isOpen={showTelemetryModal}
        isLoading={isLoading}
        onSubmit={submitTelemetry}
        error={error}
        initialCategory={category}
        initialTaskTitle={tasks.find((t: Task) => t.id === taskId)?.title}
      />
    </div>
  );
}
