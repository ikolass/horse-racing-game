import { GAME_CONFIG } from '@/config/gameConfig.js'

const VALID_TRANSITIONS = {
  IDLE: ['SCHEDULED'],
  SCHEDULED: ['RACING'],
  RACING: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['RACING', 'DONE'],
  DONE: ['IDLE'],
};

let _intervalRef = null
let _betweenRoundsTimeoutRef = null
let _countdownIntervalRef = null

const race = {
  namespaced: true,
  state: () => ({
    gamePhase: 'IDLE',
    currentRound: 0,
    positions: {},
    intervalId: null,
    roundStartedAt: null,
    roundFinishTimes: {},
    countdown: 0,
  }),
  mutations: {
    SET_GAME_PHASE(state, phase) {
      state.gamePhase = phase;
    },
    SET_CURRENT_ROUND(state, roundNumber) {
      state.currentRound = roundNumber;
    },
    SET_POSITIONS(state, positions) {
      state.positions = positions;
    },
    RESET_POSITIONS(state) {
      state.positions = {};
    },
    SET_INTERVAL_ID(state, id) {
      state.intervalId = id;
    },
    SET_ROUND_STARTED_AT(state, timestamp) {
      state.roundStartedAt = timestamp;
    },
    SET_ROUND_FINISH_TIMES(state, finishTimes) {
      state.roundFinishTimes = finishTimes;
    },
    SET_COUNTDOWN(state, countdown) {
      state.countdown = countdown;
    },
  },
  actions: {
    transitionTo({ commit, state }, phase) {
      const allowed = VALID_TRANSITIONS[state.gamePhase];
      if (!allowed || !allowed.includes(phase)) {
        console.warn(`Invalid transition: ${state.gamePhase} -> ${phase}`);
        return false;
      }
      commit('SET_GAME_PHASE', phase);
      return true;
    },
    resetRace({ commit }) {
      if (_intervalRef) {
        clearInterval(_intervalRef);
        _intervalRef = null;
      }
      if (_betweenRoundsTimeoutRef) {
        clearTimeout(_betweenRoundsTimeoutRef);
        _betweenRoundsTimeoutRef = null;
      }
      if (_countdownIntervalRef) {
        clearInterval(_countdownIntervalRef);
        _countdownIntervalRef = null;
      }
      commit('SET_INTERVAL_ID', null);
      commit('RESET_POSITIONS');
      commit('SET_CURRENT_ROUND', 0);
      commit('SET_ROUND_STARTED_AT', null);
      commit('SET_ROUND_FINISH_TIMES', {});
      commit('SET_COUNTDOWN', 0);
      commit('SET_GAME_PHASE', 'IDLE');
    },
    startRace({ commit, dispatch }) {
      commit('SET_CURRENT_ROUND', 1);
      dispatch('startRoundCountdown', 1);
    },
    startRoundCountdown({ commit, dispatch }, roundNumber) {
      if (_countdownIntervalRef) {
        clearInterval(_countdownIntervalRef);
        _countdownIntervalRef = null;
      }

      commit('SET_COUNTDOWN', GAME_CONFIG.COUNTDOWN_SECONDS);

      let countdown = GAME_CONFIG.COUNTDOWN_SECONDS;
      _countdownIntervalRef = setInterval(() => {
        countdown -= 1;
        commit('SET_COUNTDOWN', countdown);

        if (countdown <= 0) {
          clearInterval(_countdownIntervalRef);
          _countdownIntervalRef = null;
          dispatch('transitionTo', 'RACING');
          dispatch('startRoundByNumber', roundNumber);
        }
      }, GAME_CONFIG.COUNTDOWN_TICK_MS);
    },
    runRound({ commit, state, rootState, dispatch }, { horseIndices }) {
      // Defensively clear any existing interval
      if (_intervalRef) {
        clearInterval(_intervalRef);
        _intervalRef = null;
      }

      // Map horse indices to horse objects
      const horses = horseIndices.map(idx => rootState.horses.list[idx]);

      // Find max condition
      const maxCondition = Math.max(...horses.map(h => h.condition));

      // Pre-compute constant speeds (no per-tick randomness)
      const speeds = {};
      horseIndices.forEach((idx, i) => {
        speeds[idx] = horses[i].condition / (maxCondition * GAME_CONFIG.TICKS_TO_WIN);
      });

      // Initialize positions to 0
      const initPos = {};
      horseIndices.forEach(idx => { initPos[idx] = 0; });
      commit('SET_POSITIONS', initPos);
      commit('SET_ROUND_STARTED_AT', Date.now());
      commit('SET_ROUND_FINISH_TIMES', {});
      commit('SET_COUNTDOWN', 0);

      let elapsedMs = 0;

      // Start the tick loop
      _intervalRef = setInterval(() => {
        elapsedMs += GAME_CONFIG.TICK_INTERVAL_MS;
        const current = { ...state.positions };
        const finishTimes = { ...state.roundFinishTimes };
        let allDone = true;

        horseIndices.forEach(idx => {
          if (current[idx] < 1.0) {
            current[idx] = Math.min(current[idx] + speeds[idx], 1.0);
            if (current[idx] >= 1.0 && finishTimes[idx] === undefined) {
              finishTimes[idx] = elapsedMs;
            }
            if (current[idx] < 1.0) {
              allDone = false;
            }
          }
        });

        commit('SET_POSITIONS', current);
        commit('SET_ROUND_FINISH_TIMES', finishTimes);

        if (allDone) {
          clearInterval(_intervalRef);
          _intervalRef = null;
          commit('SET_INTERVAL_ID', null);
          dispatch('onRoundComplete');
        }
      }, GAME_CONFIG.TICK_INTERVAL_MS);

      commit('SET_INTERVAL_ID', _intervalRef);
    },
    onRoundComplete({ commit, state, dispatch, rootState, rootGetters }) {
      dispatch('transitionTo', 'ROUND_COMPLETE');

      // Derive finish order: sort horseIndices by condition descending (deterministic speed order)
      const round = rootGetters['schedule/roundByNumber'](state.currentRound);
      if (round) {
        const finishOrder = [...round.horseIndices].sort((a, b) => {
          return rootState.horses.list[b].condition - rootState.horses.list[a].condition;
        });
        const elapsedMs = Math.max(0, Date.now() - (state.roundStartedAt ?? Date.now()));
        dispatch('results/addRoundResult', {
          roundNumber: round.roundNumber,
          distance: round.distance,
          finishOrder,
          elapsedMs,
          finishTimes: state.roundFinishTimes,
        }, { root: true });
      }

      _betweenRoundsTimeoutRef = setTimeout(() => {
        _betweenRoundsTimeoutRef = null;
        if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
          commit('SET_ROUND_STARTED_AT', null);
          commit('SET_ROUND_FINISH_TIMES', {});
          dispatch('transitionTo', 'DONE');
        } else {
          const nextRound = state.currentRound + 1;
          commit('RESET_POSITIONS');
          commit('SET_CURRENT_ROUND', nextRound);
          commit('SET_ROUND_STARTED_AT', null);
          commit('SET_ROUND_FINISH_TIMES', {});
          dispatch('startRoundCountdown', nextRound);
        }
      }, GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS);
    },
    startRoundByNumber({ dispatch, rootGetters }, roundNumber) {
      const round = rootGetters['schedule/roundByNumber'](roundNumber);
      if (round) dispatch('runRound', { horseIndices: round.horseIndices });
    },
  },
  getters: {
    gamePhase: (state) => state.gamePhase,
    currentRound: (state) => state.currentRound,
    isIdle: (state) => state.gamePhase === 'IDLE',
    isScheduled: (state) => state.gamePhase === 'SCHEDULED',
    isRacing: (state) => state.gamePhase === 'RACING',
    isDone: (state) => state.gamePhase === 'DONE',
    countdown: (state) => state.countdown,
  },
};

export default race;
