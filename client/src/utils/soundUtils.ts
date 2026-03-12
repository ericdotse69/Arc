/**
 * Web Audio API sound synthesis utility
 * Generates minimalist chime tones for session completion
 */

export const playChime = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a simple two-tone chime using sine waves
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // First tone (higher pitch, shorter duration)
    const osc1 = audioContext.createOscillator();
    osc1.frequency.value = 800; // 800 Hz
    osc1.type = 'sine';
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (lower pitch, slightly longer) - creates harmonic effect
    const osc2 = audioContext.createOscillator();
    osc2.frequency.value = 600; // 600 Hz
    osc2.type = 'sine';
    osc2.connect(gainNode);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);

    // Envelope: quick attack, gradual decay
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  } catch (error) {
    console.error('Failed to play chime:', error);
  }
};
