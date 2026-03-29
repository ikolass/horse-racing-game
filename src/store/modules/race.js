import { GAME_CONFIG } from '@/config/gameConfig.js'

const VALID_TRANSITIONS = {
  IDLE: ['SCHEDULED'],
  SCHEDULED: ['RACING'],
  RACING: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['RACING', 'DONE'],
  DONE: ['IDLE'],
};

let _intervalRef = null

const race = {
  namespaced: true,
  state: () => ({
    gamePhase: 'IDLE',
    currentRound: 0,
    positions: {},
    intervalId: null,
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
    startRace({ commit, dispatch, rootGetters }) {
      dispatch('transitionTo', 'RACING');
      commit('SET_CURRENT_ROUND', 1);
      const round = rootGetters['schedule/roundByNumber'](1);
      if (round) dispatch('runRound', { horseIndices: round.horseIndices });
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

      // Start the tick loop
      _intervalRef = setInterval(() => {
        const current = { ...state.positions };
        let allDone = true;

        horseIndices.forEach(idx => {
          if (current[idx] < 1.0) {
            current[idx] = Math.min(current[idx] + speeds[idx], 1.0);
            if (current[idx] < 1.0) {
              allDone = false;
            }
          }
        });

        commit('SET_POSITIONS', current);

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
        dispatch('results/addRoundResult', {
          roundNumber: round.roundNumber,
          distance: round.distance,
          finishOrder,
        }, { root: true });
      }

      setTimeout(() => {
        if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
          dispatch('transitionTo', 'DONE');
        } else {
          const nextRound = state.currentRound + 1;
          commit('RESET_POSITIONS');
          commit('SET_CURRENT_ROUND', nextRound);
          dispatch('transitionTo', 'RACING');
          dispatch('startRoundByNumber', nextRound);
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
  },
};

export default race;
