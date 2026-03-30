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

  it('SET_INTERVAL_ID stores the interval handle', () => {
    const state = createRaceState()

    race.mutations.SET_INTERVAL_ID(state, 123)

    expect(state.intervalId).toBe(123)
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

  it('startRace transitions to racing, sets round 1, and dispatches the first round', () => {
    const commit = vi.fn()
    const dispatch = vi.fn()
    const round = { horseIndices: [0, 1, 2] }
    const rootGetters = {
      'schedule/roundByNumber': vi.fn(() => round),
    }

    race.actions.startRace({ commit, dispatch, rootGetters })

    expect(dispatch).toHaveBeenNthCalledWith(1, 'transitionTo', 'RACING')
    expect(commit).toHaveBeenCalledWith('SET_CURRENT_ROUND', 1)
    expect(dispatch).toHaveBeenNthCalledWith(2, 'runRound', { horseIndices: round.horseIndices })
  })

  it('runRound initializes positions, advances them on timers, and dispatches onRoundComplete', () => {
    const commit = vi.fn((type, payload) => {
      if (type === 'SET_POSITIONS') {
        state.positions = payload
      }
      if (type === 'SET_INTERVAL_ID') {
        state.intervalId = payload
      }
    })
    const dispatch = vi.fn()
    const state = createRaceState()
    const rootState = {
      horses: horses.state(),
    }
    const horseIndices = [0, 8]

    race.actions.runRound({ commit, state, rootState, dispatch }, { horseIndices })

    expect(commit).toHaveBeenCalledWith('SET_POSITIONS', { 0: 0, 8: 0 })
    expect(commit).toHaveBeenCalledWith('SET_INTERVAL_ID', expect.anything())

    vi.advanceTimersByTime(GAME_CONFIG.TICK_INTERVAL_MS * 80)

    expect(state.positions[8]).toBe(1)
    expect(state.positions[0]).toBe(1)
    expect(commit).toHaveBeenCalledWith('SET_INTERVAL_ID', null)
    expect(dispatch).toHaveBeenCalledWith('onRoundComplete')
  })

  it('onRoundComplete records results and advances to the next round when more rounds remain', () => {
    const commit = vi.fn()
    const dispatch = vi.fn()
    const state = {
      ...createRaceState(),
      currentRound: 1,
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
    expect(dispatch).toHaveBeenNthCalledWith(2, 'results/addRoundResult', {
      roundNumber: 1,
      distance: 1200,
      finishOrder: [8, 1, 4],
    }, { root: true })

    vi.advanceTimersByTime(GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS)

    expect(commit).toHaveBeenCalledWith('RESET_POSITIONS')
    expect(commit).toHaveBeenCalledWith('SET_CURRENT_ROUND', 2)
    expect(dispatch).toHaveBeenCalledWith('transitionTo', 'RACING')
    expect(dispatch).toHaveBeenCalledWith('startRoundByNumber', 2)
  })

  it('onRoundComplete transitions to DONE after round six', () => {
    const commit = vi.fn()
    const dispatch = vi.fn()
    const state = {
      ...createRaceState(),
      currentRound: GAME_CONFIG.TOTAL_ROUNDS,
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

    expect(dispatch).toHaveBeenCalledWith('transitionTo', 'DONE')
    expect(dispatch).not.toHaveBeenCalledWith('startRoundByNumber', expect.anything())
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
