import { GAME_CONFIG } from '@/config/gameConfig.js'
import horses from '@/store/modules/horses.js'
import race from '@/store/modules/race.js'

function createRaceState() {
  return race.state()
}

describe('race module mutations', () => {
  it('SET_GAME_PHASE updates the phase', () => {
    const state = createRaceState()

    race.mutations.SET_GAME_PHASE(state, 'SCHEDULED')

    expect(state.gamePhase).toBe('SCHEDULED')
  })

  it('SET_CURRENT_ROUND updates the current round', () => {
    const state = createRaceState()

    race.mutations.SET_CURRENT_ROUND(state, 3)

    expect(state.currentRound).toBe(3)
  })

  it('SET_POSITIONS replaces the positions map', () => {
    const state = createRaceState()
    const positions = { 1: 0.5, 2: 0.8 }

    race.mutations.SET_POSITIONS(state, positions)

    expect(state.positions).toEqual(positions)
  })

  it('RESET_POSITIONS clears the positions map', () => {
    const state = createRaceState()
    state.positions = { 1: 0.5 }

    race.mutations.RESET_POSITIONS(state)

    expect(state.positions).toEqual({})
  })

  it('SET_ROUND_STARTED_AT stores the active round start timestamp', () => {
    const state = createRaceState()

    race.mutations.SET_ROUND_STARTED_AT(state, 456)

    expect(state.roundStartedAt).toBe(456)
  })

  it('SET_ROUND_FINISH_TIMES stores the current round finish times', () => {
    const state = createRaceState()

    race.mutations.SET_ROUND_FINISH_TIMES(state, { 1: 1200 })

    expect(state.roundFinishTimes).toEqual({ 1: 1200 })
  })

  it('SET_COUNTDOWN stores the current round countdown value', () => {
    const state = createRaceState()

    race.mutations.SET_COUNTDOWN(state, 3)

    expect(state.countdown).toBe(3)
  })
})

describe('race module getters', () => {
  it('isRoundActive is true only when countdown is over and race is active', () => {
    expect(race.getters.isRoundActive({ gamePhase: 'RACING', countdown: 0 })).toBe(true)
    expect(race.getters.isRoundActive({ gamePhase: 'ROUND_COMPLETE', countdown: 0 })).toBe(true)
    expect(race.getters.isRoundActive({ gamePhase: 'RACING', countdown: 2 })).toBe(false)
    expect(race.getters.isRoundActive({ gamePhase: 'SCHEDULED', countdown: 0 })).toBe(false)
  })

  it('canGenerateSchedule blocks only during an active round or countdown', () => {
    expect(race.getters.canGenerateSchedule({ countdown: 0 }, { isRoundActive: false })).toBe(true)
    expect(race.getters.canGenerateSchedule({ countdown: 0 }, { isRoundActive: true })).toBe(false)
    expect(race.getters.canGenerateSchedule({ countdown: 2 }, { isRoundActive: false })).toBe(false)
  })

  it('canStartRace allows only scheduled idle-between-round states without countdown', () => {
    expect(race.getters.canStartRace({ gamePhase: 'SCHEDULED', countdown: 0 })).toBe(true)
    expect(race.getters.canStartRace({ gamePhase: 'IDLE', countdown: 0 })).toBe(false)
    expect(race.getters.canStartRace({ gamePhase: 'DONE', countdown: 0 })).toBe(false)
    expect(race.getters.canStartRace({ gamePhase: 'RACING', countdown: 0 })).toBe(false)
    expect(race.getters.canStartRace({ gamePhase: 'ROUND_COMPLETE', countdown: 0 })).toBe(false)
    expect(race.getters.canStartRace({ gamePhase: 'SCHEDULED', countdown: 1 })).toBe(false)
  })
})

describe('race module actions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('transitionTo accepts valid transitions and commits the new phase', () => {
    const commit = vi.fn()
    const state = { gamePhase: 'IDLE' }

    const result = race.actions.transitionTo({ commit, state }, 'SCHEDULED')

    expect(result).toBe(true)
    expect(commit).toHaveBeenCalledWith('SET_GAME_PHASE', 'SCHEDULED')
  })

  it('transitionTo rejects invalid transitions and warns', () => {
    const commit = vi.fn()
    const state = { gamePhase: 'IDLE' }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = race.actions.transitionTo({ commit, state }, 'DONE')

    expect(result).toBe(false)
    expect(commit).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('resetRace clears positions, timing, round, and phase state', () => {
    const commit = vi.fn()

    race.actions.resetRace({ commit })

    expect(commit).toHaveBeenNthCalledWith(1, 'RESET_POSITIONS')
    expect(commit).toHaveBeenNthCalledWith(2, 'SET_ROUND_STARTED_AT', null)
    expect(commit).toHaveBeenNthCalledWith(3, 'SET_ROUND_FINISH_TIMES', {})
    expect(commit).toHaveBeenNthCalledWith(4, 'SET_COUNTDOWN', 0)
    expect(commit).toHaveBeenNthCalledWith(5, 'SET_CURRENT_ROUND', 0)
    expect(commit).toHaveBeenNthCalledWith(6, 'SET_GAME_PHASE', 'IDLE')
  })

  it('startRace sets round 1 and begins the countdown for the first round', () => {
    const commit = vi.fn()
    const dispatch = vi.fn()

    race.actions.startRace({ commit, dispatch })

    expect(commit).toHaveBeenCalledWith('SET_CURRENT_ROUND', 1)
    expect(dispatch).toHaveBeenCalledWith('startRoundCountdown', 1)
  })

  it('startRoundCountdown counts down 3 2 1 and then starts racing', () => {
    const commit = vi.fn()
    const dispatch = vi.fn()

    race.actions.startRoundCountdown({ commit, dispatch }, 2)

    expect(commit).toHaveBeenCalledWith('SET_COUNTDOWN', GAME_CONFIG.COUNTDOWN_SECONDS)

    vi.advanceTimersByTime(GAME_CONFIG.COUNTDOWN_TICK_MS)
    expect(commit).toHaveBeenCalledWith('SET_COUNTDOWN', 2)

    vi.advanceTimersByTime(GAME_CONFIG.COUNTDOWN_TICK_MS)
    expect(commit).toHaveBeenCalledWith('SET_COUNTDOWN', 1)

    vi.advanceTimersByTime(GAME_CONFIG.COUNTDOWN_TICK_MS)
    expect(commit).toHaveBeenCalledWith('SET_COUNTDOWN', 0)
    expect(dispatch).toHaveBeenCalledWith('transitionTo', 'RACING')
    expect(dispatch).toHaveBeenCalledWith('startRoundByNumber', 2)
  })

  it('runRound initializes positions, advances them on timers, and dispatches onRoundComplete', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const state = createRaceState()
    const commit = vi.fn((type, payload) => {
      if (type === 'SET_POSITIONS') {
        state.positions = payload
      }
      if (type === 'SET_ROUND_STARTED_AT') {
        state.roundStartedAt = payload
      }
      if (type === 'SET_ROUND_FINISH_TIMES') {
        state.roundFinishTimes = payload
      }
    })
    const dispatch = vi.fn()
    const rootState = {
      horses: horses.state(),
    }
    const horseIndices = [0, 8]

    race.actions.runRound({ commit, state, rootState, dispatch }, { horseIndices })

    expect(commit).toHaveBeenCalledWith('SET_POSITIONS', { 0: 0, 8: 0 })
    expect(commit).toHaveBeenCalledWith('SET_ROUND_STARTED_AT', 1000)
    expect(commit).toHaveBeenCalledWith('SET_ROUND_FINISH_TIMES', {})

    vi.advanceTimersByTime(GAME_CONFIG.TICK_INTERVAL_MS * 80)

    expect(state.positions[8]).toBe(1)
    expect(state.positions[0]).toBe(1)
    expect(state.roundFinishTimes[8]).toBeGreaterThan(0)
    expect(state.roundFinishTimes[0]).toBeGreaterThan(0)
    expect(dispatch).toHaveBeenCalledWith('onRoundComplete')
  })

  it('onRoundComplete records results and advances to the next round when more rounds remain', () => {
    vi.spyOn(Date, 'now').mockReturnValue(3200)
    const commit = vi.fn()
    const dispatch = vi.fn()
    const state = {
      ...createRaceState(),
      currentRound: 1,
      roundStartedAt: 1000,
      roundFinishTimes: { 8: 1400, 1: 1800, 4: 2200 },
    }
    const rootState = {
      horses: horses.state(),
    }
    const round = {
      roundNumber: 1,
      distance: 1200,
      horseIndices: [1, 8, 4],
    }
    const rootGetters = {
      'schedule/roundByNumber': vi.fn(() => round),
    }

    race.actions.onRoundComplete({ commit, state, dispatch, rootState, rootGetters })

    expect(dispatch).toHaveBeenNthCalledWith(1, 'transitionTo', 'ROUND_COMPLETE')
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      'results/addRoundResult',
      {
        roundNumber: 1,
        distance: 1200,
        finishOrder: [8, 1, 4],
        elapsedMs: 2200,
        finishTimes: { 8: 1400, 1: 1800, 4: 2200 },
      },
      { root: true },
    )

    vi.advanceTimersByTime(GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS)

    expect(commit).toHaveBeenCalledWith('RESET_POSITIONS')
    expect(commit).toHaveBeenCalledWith('SET_ROUND_STARTED_AT', null)
    expect(commit).toHaveBeenCalledWith('SET_ROUND_FINISH_TIMES', {})
    expect(commit).toHaveBeenCalledWith('SET_CURRENT_ROUND', 2)
    expect(dispatch).toHaveBeenCalledWith('startRoundCountdown', 2)
  })

  it('onRoundComplete transitions to DONE after round six', () => {
    vi.spyOn(Date, 'now').mockReturnValue(5400)
    const commit = vi.fn()
    const dispatch = vi.fn()
    const state = {
      ...createRaceState(),
      currentRound: GAME_CONFIG.TOTAL_ROUNDS,
      roundStartedAt: 2000,
      roundFinishTimes: { 8: 1400, 1: 1800, 4: 2200 },
    }
    const rootState = {
      horses: horses.state(),
    }
    const round = {
      roundNumber: GAME_CONFIG.TOTAL_ROUNDS,
      distance: 2200,
      horseIndices: [1, 8, 4],
    }
    const rootGetters = {
      'schedule/roundByNumber': vi.fn(() => round),
    }

    race.actions.onRoundComplete({ commit, state, dispatch, rootState, rootGetters })
    vi.advanceTimersByTime(GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS)

    expect(commit).toHaveBeenCalledWith('SET_ROUND_STARTED_AT', null)
    expect(commit).toHaveBeenCalledWith('SET_ROUND_FINISH_TIMES', {})
    expect(dispatch).toHaveBeenCalledWith('transitionTo', 'DONE')
    expect(dispatch).not.toHaveBeenCalledWith('startRoundCountdown', expect.anything())
  })

  it('startRoundByNumber dispatches runRound for the requested round', () => {
    const dispatch = vi.fn()
    const round = { horseIndices: [2, 3, 4] }
    const rootGetters = {
      'schedule/roundByNumber': vi.fn(() => round),
    }

    race.actions.startRoundByNumber({ dispatch, rootGetters }, 3)

    expect(rootGetters['schedule/roundByNumber']).toHaveBeenCalledWith(3)
    expect(dispatch).toHaveBeenCalledWith('runRound', { horseIndices: [2, 3, 4] })
  })
})
