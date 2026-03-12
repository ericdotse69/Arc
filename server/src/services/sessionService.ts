import { SessionRepository } from '../data-access/sessionRepository';
import { Session, CreateSessionInput, UpdateSessionInput } from '../models/types';

/**
 * Calculate Flow Score (0-100) based on session telemetry
 * Algorithm:
 * - Base score on duration (25 min = 25 points, 60+ min = 50 points)
 * - Cognitive load multiplier (rated 1-10, gives 20-100 points)
 * - Distraction penalty (-10 points per distraction, minimum 0)
 * - Final score is weighted: 40% duration + 60% cognitive load - distractions
 */
function calculateFlowScore(
  durationSeconds: number,
  cognitiveLoad: number | null | undefined,
  distractions: number | null | undefined
): number {
  // Default values
  const load = cognitiveLoad && cognitiveLoad >= 1 && cognitiveLoad <= 10 ? cognitiveLoad : 5;
  const distCount = distractions && distractions > 0 ? distractions : 0;

  // Duration score: 25 min = 25 points, scaled up to 50 max
  const durationMinutes = durationSeconds / 60;
  const durationScore = Math.min(durationMinutes, 50);

  // Cognitive load score: 1-10 scale mapped to 20-100 points
  const loadScore = load * 10;

  // Weighted combination: 40% duration + 60% cognitive load
  let flowScore = durationScore * 0.4 + loadScore * 0.6;

  // Apply distraction penalty: -10 per distraction
  flowScore = flowScore - distCount * 10;

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(flowScore)));
}

export const SessionService = {
  async createSession(input: CreateSessionInput): Promise<Session> {
    // Validate input
    if (!input.userId || input.userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!input.category || input.category.trim().length === 0) {
      throw new Error('Category is required');
    }
    if (input.taskId !== undefined && input.taskId !== null && input.taskId <= 0) {
      throw new Error('Invalid task ID');
    }

    return SessionRepository.create(input);
  },

  async endSession(
    sessionId: number,
    input: UpdateSessionInput & { taskId?: number | null }
  ): Promise<Session> {
    // Validate session exists
    const session = await SessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Validate input
    if (!input.endTime) {
      throw new Error('End time is required');
    }
    if (input.totalDuration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    if (input.status !== 'completed' && input.status !== 'interrupted') {
      throw new Error('Invalid status');
    }

    // Calculate Flow Score for completed sessions
    let flowScore: number | null = null;
    if (input.status === 'completed') {
      flowScore = calculateFlowScore(input.totalDuration, input.cognitiveLoad, input.distractions);
    }

    // Add flow score to update input
    const updateWithScore = {
      ...input,
      flowScore,
      distractions: input.distractions || 0,
    };

    return SessionRepository.update(sessionId, updateWithScore);
  },

  async getUserSessions(userId: number): Promise<Session[]> {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    return SessionRepository.findByUserId(userId);
  },

  async getSessionById(sessionId: number): Promise<Session | null> {
    if (!sessionId || sessionId <= 0) {
      throw new Error('Invalid session ID');
    }
    return SessionRepository.findById(sessionId);
  },

  async deleteSession(sessionId: number): Promise<void> {
    const session = await SessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    await SessionRepository.delete(sessionId);
  },
};
