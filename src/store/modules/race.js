import { GAME_CONFIG } from '@/config/gameConfig.js'

const VALID_TRANSITIONS = {
  IDLE: ['SCHEDULED'],
  SCHEDULED: ['RACING'],
  RACING: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['RACING', 'DONE'],
  DONE: ['IDLE'],
}

let _intervalRef = null
let _betweenRoundsTimeoutRef = null
let _countdownIntervalRef = null

const race = {
  namespaced: true,
  state: () => ({
    gamePhase: 'IDLE',
    currentRound: 0,
    positions: {},
    roundStartedAt: null,
    roundFinishTimes: {},
    countdown: 0,
  }),
  mutations: {
    SET_GAME_PHASE(state, phase) {
      state.gamePhase = phase
    },
    SET_CURRENT_ROUND(state, roundNumber) {
      state.currentRound = roundNumber
    },
    SET_POSITIONS(state, positions) {
      state.positions = positions
    },
    RESET_POSITIONS(state) {
      state.positions = {}
    },
    SET_ROUND_STARTED_AT(state, timestamp) {
      state.roundStartedAt = timestamp
    },
    SET_ROUND_FINISH_TIMES(state, finishTimes) {
      state.roundFinishTimes = finishTimes
    },
    SET_COUNTDOWN(state, countdown) {
      state.countdown = countdown
    },
  },
  actions: {
    transitionTo({ commit, state }, phase) {
      const allowed = VALID_TRANSITIONS[state.gamePhase]
      if (!allowed || !allowed.includes(phase)) {
        console.warn(`Invalid transition: ${state.gamePhase} -> ${phase}`)
        return false
      }
      commit('SET_GAME_PHASE', phase)
      return true
    },
    resetRace({ commit }) {
      if (_intervalRef) {
        clearInterval(_intervalRef)
        _intervalRef = null
      }
      if (_betweenRoundsTimeoutRef) {
        clearTimeout(_betweenRoundsTimeoutRef)
        _betweenRoundsTimeoutRef = null
      }
      if (_countdownIntervalRef) {
        clearInterval(_countdownIntervalRef)
        _countdownIntervalRef = null
      }
      commit('RESET_POSITIONS')
      commit('SET_CURRENT_ROUND', 0)
      commit('SET_ROUND_STARTED_AT', null)
      commit('SET_ROUND_FINISH_TIMES', {})
      commit('SET_COUNTDOWN', 0)
      commit('SET_GAME_PHASE', 'IDLE')
    },
    startRace({ commit, dispatch }) {
      commit('SET_CURRENT_ROUND', 1)
      dispatch('startRoundCountdown', 1)
    },
    startRoundCountdown({ commit, dispatch }, roundNumber) {
      if (_countdownIntervalRef) {
        clearInterval(_countdownIntervalRef)
        _countdownIntervalRef = null
      }

      commit('SET_COUNTDOWN', GAME_CONFIG.COUNTDOWN_SECONDS)

      let countdown = GAME_CONFIG.COUNTDOWN_SECONDS
      _countdownIntervalRef = setInterval(() => {
        countdown -= 1
        commit('SET_COUNTDOWN', countdown)

        if (countdown <= 0) {
          clearInterval(_countdownIntervalRef)
          _countdownIntervalRef = null
          dispatch('transitionTo', 'RACING')
          dispatch('startRoundByNumber', roundNumber)
        }
      }, GAME_CONFIG.COUNTDOWN_TICK_MS)
    },
    runRound({ commit, state, rootState, dispatch }, { horseIndices }) {
      if (_intervalRef) {
        clearInterval(_intervalRef)
        _intervalRef = null
      }

      const horses = horseIndices.map((idx) => rootState.horses.list[idx])
      const maxCondition = Math.max(...horses.map((horse) => horse.condition))
      const speeds = {}

      horseIndices.forEach((idx, i) => {
        speeds[idx] = horses[i].condition / (maxCondition * GAME_CONFIG.TICKS_TO_WIN)
      })

      const initialPositions = {}
      horseIndices.forEach((idx) => {
        initialPositions[idx] = 0
      })

      commit('SET_POSITIONS', initialPositions)
      commit('SET_ROUND_STARTED_AT', Date.now())
      commit('SET_ROUND_FINISH_TIMES', {})
      commit('SET_COUNTDOWN', 0)

      let elapsedMs = 0

      _intervalRef = setInterval(() => {
        elapsedMs += GAME_CONFIG.TICK_INTERVAL_MS
        const current = { ...state.positions }
        const finishTimes = { ...state.roundFinishTimes }
        let allDone = true

        horseIndices.forEach((idx) => {
          if (current[idx] < 1) {
            current[idx] = Math.min(current[idx] + speeds[idx], 1)
            if (current[idx] >= 1 && finishTimes[idx] === undefined) {
              finishTimes[idx] = elapsedMs
            }
            if (current[idx] < 1) {
              allDone = false
            }
          }
        })

        commit('SET_POSITIONS', current)
        commit('SET_ROUND_FINISH_TIMES', finishTimes)

        if (allDone) {
          clearInterval(_intervalRef)
          _intervalRef = null
          dispatch('onRoundComplete')
        }
      }, GAME_CONFIG.TICK_INTERVAL_MS)
    },
    onRoundComplete({ commit, state, dispatch, rootState, rootGetters }) {
      dispatch('transitionTo', 'ROUND_COMPLETE')

      const round = rootGetters['schedule/roundByNumber'](state.currentRound)
      if (round) {
        const finishOrder = [...round.horseIndices].sort(
          (a, b) => rootState.horses.list[b].condition - rootState.horses.list[a].condition,
        )
        const elapsedMs = Math.max(0, Date.now() - (state.roundStartedAt ?? Date.now()))
        dispatch(
          'results/addRoundResult',
          {
            roundNumber: round.roundNumber,
            distance: round.distance,
            finishOrder,
            elapsedMs,
            finishTimes: state.roundFinishTimes,
          },
          { root: true },
        )
      }

      _betweenRoundsTimeoutRef = setTimeout(() => {
        _betweenRoundsTimeoutRef = null
        if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
          commit('SET_ROUND_STARTED_AT', null)
          commit('SET_ROUND_FINISH_TIMES', {})
          dispatch('transitionTo', 'DONE')
        } else {
          const nextRound = state.currentRound + 1
          commit('RESET_POSITIONS')
          commit('SET_CURRENT_ROUND', nextRound)
          commit('SET_ROUND_STARTED_AT', null)
          commit('SET_ROUND_FINISH_TIMES', {})
          dispatch('startRoundCountdown', nextRound)
        }
      }, GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS)
    },
    startRoundByNumber({ dispatch, rootGetters }, roundNumber) {
      const round = rootGetters['schedule/roundByNumber'](roundNumber)
      if (round) {
        dispatch('runRound', { horseIndices: round.horseIndices })
      }
    },
  },
  getters: {
    gamePhase: (state) => state.gamePhase,
    currentRound: (state) => state.currentRound,
    countdown: (state) => state.countdown,
  },
}

export default race
