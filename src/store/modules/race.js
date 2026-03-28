const VALID_TRANSITIONS = {
  IDLE: ['SCHEDULED'],
  SCHEDULED: ['RACING'],
  RACING: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['RACING', 'DONE'],
  DONE: ['IDLE'],
};

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
    startRace({ commit, dispatch }) {
      dispatch('transitionTo', 'RACING');
      commit('SET_CURRENT_ROUND', 1);
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
