const results = {
  namespaced: true,
  state: () => ({
    rounds: [],
  }),
  mutations: {
    ADD_ROUND_RESULT(state, result) {
      state.rounds.push(result);
    },
    CLEAR_RESULTS(state) {
      state.rounds = [];
    },
  },
  getters: {
    allResults: (state) => state.rounds,
    resultByRound: (state) => (num) => state.rounds.find(r => r.roundNumber === num),
    resultCount: (state) => state.rounds.length,
  },
};

export default results;
