const results = {
  namespaced: true,
  state: () => ({
    rounds: [],
  }),
  mutations: {
    ADD_ROUND_RESULT(state, result) {
      state.rounds.push(result)
    },
    CLEAR_RESULTS(state) {
      state.rounds = []
    },
  },
  actions: {
    addRoundResult({ commit }, result) {
      commit('ADD_ROUND_RESULT', result)
    },
    clearResults({ commit }) {
      commit('CLEAR_RESULTS')
    },
  },
  getters: {
    allResults: (state) => state.rounds,
    resultByRound: (state) => (num) => state.rounds.find((round) => round.roundNumber === num),
  },
}

export default results
