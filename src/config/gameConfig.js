const isE2EMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('e2e')

export const GAME_CONFIG = Object.freeze({
  TOTAL_HORSES: 20,
  HORSES_PER_ROUND: 10,
  TOTAL_ROUNDS: 6,
  COUNTDOWN_SECONDS: 3,
  ROUND_DISTANCES: Object.freeze([1200, 1400, 1600, 1800, 2000, 2200]),
  TICK_INTERVAL_MS: isE2EMode ? 10 : 50,
  TICKS_TO_WIN: isE2EMode ? 10 : 60,
  PAUSE_BETWEEN_ROUNDS_MS: isE2EMode ? 50 : 1500,
  COUNTDOWN_TICK_MS: isE2EMode ? 50 : 1000,
})
