import { GAME_CONFIG } from '@/config/gameConfig.js'
import { shuffle } from '@/utils/shuffle.js'

const schedule = {
  namespaced: true,
  state: () => ({
    rounds: [],
  }),
  mutations: {
    SET_ROUNDS(state, rounds) {
      state.rounds = rounds
    },
    CLEAR_SCHEDULE(state) {
      state.rounds = []
    },
  },
  actions: {
    generateSchedule({ commit, rootState }) {
      const allIndices = rootState.horses.list.map((_, i) => i)
      const rounds = []

      for (let i = 0; i < GAME_CONFIG.TOTAL_ROUNDS; i += 1) {
        const shuffled = shuffle(allIndices)
        const horseIndices = shuffled.slice(0, GAME_CONFIG.HORSES_PER_ROUND)

        rounds.push({
          roundNumber: i + 1,
          distance: GAME_CONFIG.ROUND_DISTANCES[i],
          horseIndices,
        })
      }

      commit('SET_ROUNDS', rounds)
    },
  },
  getters: {
    allRounds: (state) => state.rounds,
    roundByNumber: (state) => (num) => state.rounds.find((round) => round.roundNumber === num),
  },
}

export default schedule
