import schedule from '@/store/modules/schedule.js'
import horses from '@/store/modules/horses.js'

describe('schedule module', () => {
  it('SET_ROUNDS stores the provided rounds', () => {
    const state = schedule.state()
    const rounds = [{ roundNumber: 1, distance: 1200, horseIndices: [1, 2, 3] }]

    schedule.mutations.SET_ROUNDS(state, rounds)

    expect(state.rounds).toEqual(rounds)
  })

  it('CLEAR_SCHEDULE resets rounds to an empty array', () => {
    const state = schedule.state()
    state.rounds = [{ roundNumber: 1, distance: 1200, horseIndices: [1, 2, 3] }]

    schedule.mutations.CLEAR_SCHEDULE(state)

    expect(state.rounds).toEqual([])
  })

  it('generateSchedule creates six rounds with ten distinct horses and fixed distances', () => {
    const commit = vi.fn()
    const rootState = { horses: horses.state() }

    schedule.actions.generateSchedule({ commit, rootState })

    expect(commit).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith('SET_ROUNDS', expect.any(Array))

    const generatedRounds = commit.mock.calls[0][1]

    expect(generatedRounds).toHaveLength(6)
    expect(generatedRounds.map((round) => round.distance)).toEqual([
      1200, 1400, 1600, 1800, 2000, 2200,
    ])

    generatedRounds.forEach((round, index) => {
      expect(round.roundNumber).toBe(index + 1)
      expect(round.horseIndices).toHaveLength(10)
      expect(new Set(round.horseIndices).size).toBe(10)
    })
  })
})
