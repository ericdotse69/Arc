import { useState, useCallback, useEffect, useRef } from 'react';
import { sessionsAPI } from '../api/sessionsAPI';
import { tasksAPI, Task } from '../api/tasksAPI';
import { playChime } from '../utils/soundUtils';
import type { TelemetryData } from '../components/PostSessionModal';

type TimerState = 'idle' | 'working' | 'short-break' | 'long-break';
type ProtocolType = 'standard' | 'deep' | 'ultradian';

interface ArcTimerState {
  state: TimerState;
  timeRemaining: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalFocusTime: number;
  protocol: ProtocolType;
}

interface UseArcTimerState extends ArcTimerState {
  formattedTime: string;
  isLoading: boolean;
  error: string | null;
  currentSessionId: number | null;
  showTelemetryModal: boolean;
  category: string;
  tasks: Task[];
  taskId: number | null;
}

interface UseArcTimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  advanceState: () => void;
  setProtocol: (protocol: ProtocolType) => void;
  setCategory: (category: string) => void;
  setTaskId: (id: number | null) => void;
  submitTelemetry: (data: TelemetryData) => Promise<void>;
  closeTelemetryModal: () => void;
}

// Protocol durations (in seconds)
const PROTOCOL_DURATIONS = {
  standard: {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  },
  deep: {
    work: 50 * 60,
    short: 10 * 60,
    long: 15 * 60,
  },
  ultradian: {
    work: 90 * 60,
    short: 15 * 60,
    long: 20 * 60,
  },
};

const LONG_BREAK_INTERVAL = 4;

export const useArcTimer = (): UseArcTimerState & UseArcTimerActions => {
  const [protocol, setProtocolState] = useState<ProtocolType>('standard');
  const [category, setCategoryState] = useState<string>('Coding');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState<number | null>(null);
  const currentDurations = PROTOCOL_DURATIONS[protocol];

  const [timerState, setTimerState] = useState<ArcTimerState>({
    state: 'idle',
    timeRemaining: currentDurations.work,
    isRunning: false,
    sessionsCompleted: 0,
    totalFocusTime: 0,
    protocol,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionBeginTimeRef = useRef<Date | null>(null);

  const setProtocol = useCallback((newProtocol: ProtocolType) => {
    setProtocolState(newProtocol);
    setTimerState((prev) => ({
      ...prev,
      protocol: newProtocol,
      state: 'idle',
      timeRemaining: PROTOCOL_DURATIONS[newProtocol].work,
      isRunning: false,
    }));
  }, []);

  const submitTelemetry = useCallback(
    async (telemetryData: TelemetryData) => {
      if (!currentSessionId) {
        setError('No session to log');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await sessionsAPI.endSession({
          sessionId: currentSessionId,
          endTime: new Date().toISOString(),
          totalDuration: currentDurations.work,
          status: 'completed',
          cognitiveLoad: telemetryData.cognitiveLoad,
          category: telemetryData.category,
          distractions: telemetryData.distractions,
          taskId: taskId,
        });

        setShowTelemetryModal(false);
        setCurrentSessionId(null);
        advanceStateToBreak();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to log session';
        setError(errorMsg);
        console.error('Failed to submit telemetry:', errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, currentDurations.work]
  );

  const closeTelemetryModal = useCallback(() => {
    setShowTelemetryModal(false);
  }, []);

  const advanceStateToBreak = () => {
    setTimerState((prev) => {
      const shouldLongBreak = (prev.sessionsCompleted + 1) % LONG_BREAK_INTERVAL === 0;
      const nextState = shouldLongBreak ? 'long-break' : 'short-break';
      const nextDuration = shouldLongBreak
        ? PROTOCOL_DURATIONS[prev.protocol].long
        : PROTOCOL_DURATIONS[prev.protocol].short;

      return {
        ...prev,
        state: nextState,
        timeRemaining: nextDuration,
        isRunning: false,
        sessionsCompleted: prev.sessionsCompleted + 1,
        totalFocusTime: prev.totalFocusTime + PROTOCOL_DURATIONS[prev.protocol].work,
      };
    });
  };

  const advanceState = useCallback(() => {
    setTimerState((prev) => {
      let nextState: TimerState;
      let nextDuration: number;

      switch (prev.state) {
        case 'idle':
          nextState = 'working';
          nextDuration = PROTOCOL_DURATIONS[prev.protocol].work;
          break;

        case 'working':
          const shouldLongBreak = (prev.sessionsCompleted + 1) % LONG_BREAK_INTERVAL === 0;
          nextState = shouldLongBreak ? 'long-break' : 'short-break';
          nextDuration = shouldLongBreak
            ? PROTOCOL_DURATIONS[prev.protocol].long
            : PROTOCOL_DURATIONS[prev.protocol].short;
          break;

        case 'short-break':
        case 'long-break':
          nextState = 'idle';
          nextDuration = PROTOCOL_DURATIONS[prev.protocol].work;
          break;

        default:
          nextState = 'idle';
          nextDuration = PROTOCOL_DURATIONS[prev.protocol].work;
      }

      return {
        ...prev,
        state: nextState,
        timeRemaining: nextDuration,
        isRunning: false,
      };
    });
  }, []);

  const start = useCallback(async () => {
    if (timerState.isRunning) return;

    sessionStartTimeRef.current = Date.now();
    setError(null);

    setTimerState((prev) => {
      let nextState = prev.state;
      let nextDuration = prev.timeRemaining;

      if (prev.state === 'idle') {
        nextState = 'working';
        nextDuration = PROTOCOL_DURATIONS[prev.protocol].work;
      }

      return {
        ...prev,
        state: nextState,
        timeRemaining: nextDuration,
        isRunning: true,
      };
    });

    if (timerState.state === 'idle') {
      setIsLoading(true);
      try {
        sessionBeginTimeRef.current = new Date();
        const response = await sessionsAPI.startSession({
          category,
          taskId: taskId || undefined,
        });
        setCurrentSessionId(response.data.id);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to start session';
        setError(errorMsg);
        console.error('Failed to start session:', errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  }, [timerState.isRunning, timerState.state, timerState.protocol, category, taskId]);

  const pause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setTimerState({
      state: 'idle',
      timeRemaining: PROTOCOL_DURATIONS[protocol].work,
      isRunning: false,
      sessionsCompleted: timerState.sessionsCompleted,
      totalFocusTime: timerState.totalFocusTime,
      protocol,
    });
    sessionStartTimeRef.current = null;
    sessionBeginTimeRef.current = null;
    setCurrentSessionId(null);
    setShowTelemetryModal(false);
    setError(null);
  }, [timerState.sessionsCompleted, timerState.totalFocusTime, protocol]);

  const skip = useCallback(() => {
    advanceState();
    sessionStartTimeRef.current = null;
    sessionBeginTimeRef.current = null;
    setCurrentSessionId(null);
    setShowTelemetryModal(false);
  }, [advanceState]);

  useEffect(() => {
    if (!timerState.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);

        if (newTimeRemaining === 0) {
          return prev;
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning]);

  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining === 0 && timerState.state === 'working') {
      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
      }));
      // Play chime sound on session completion
      playChime();
      setShowTelemetryModal(true);
    }
  }, [timerState.isRunning, timerState.timeRemaining, timerState.state]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // fetch tasks once when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const list = await tasksAPI.getUserTasks();
        setTasks(list);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };
    loadTasks();
  }, []);

  return {
    ...timerState,
    formattedTime: formatTime(timerState.timeRemaining),
    isLoading,
    error,
    currentSessionId,
    showTelemetryModal,
    category,
    tasks,
    taskId,
    start,
    pause,
    reset,
    skip,
    advanceState,
    setProtocol,
    setCategory: setCategoryState,
    setTaskId,
    submitTelemetry,
    closeTelemetryModal,
  };
};
