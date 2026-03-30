import { createStore } from 'vuex'
import horses from './modules/horses.js'
import schedule from './modules/schedule.js'
import race from './modules/race.js'
import results from './modules/results.js'

const store = createStore({
  modules: {
    horses,
    schedule,
    race,
    results,
  },
})

export default store
