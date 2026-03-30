import { createStore } from 'vuex'

import horses from '@/store/modules/horses.js'
import race from '@/store/modules/race.js'
import results from '@/store/modules/results.js'
import schedule from '@/store/modules/schedule.js'

function withStateOverride(moduleDef, override) {
  return {
    ...moduleDef,
    state: () => {
      const baseState = moduleDef.state()
      if (!override) {
        return baseState
      }

      return {
        ...baseState,
        ...override,
      }
    },
  }
}

export function createTestStore(overrides = {}) {
  return createStore({
    modules: {
      horses: withStateOverride(horses, overrides.horses),
      schedule: withStateOverride(schedule, overrides.schedule),
      race: withStateOverride(race, overrides.race),
      results: withStateOverride(results, overrides.results),
    },
  })
}
