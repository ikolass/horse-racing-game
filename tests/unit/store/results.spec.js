import results from '@/store/modules/results.js'

describe('results module', () => {
  it('ADD_ROUND_RESULT appends a result object', () => {
    const state = results.state()
    const result = { roundNumber: 1, distance: 1200, finishOrder: [1, 2, 3] }

    results.mutations.ADD_ROUND_RESULT(state, result)

    expect(state.rounds).toEqual([result])
  })

  it('CLEAR_RESULTS resets rounds to an empty array', () => {
    const state = results.state()
    state.rounds = [{ roundNumber: 1, distance: 1200, finishOrder: [1, 2, 3] }]

    results.mutations.CLEAR_RESULTS(state)

    expect(state.rounds).toEqual([])
  })

  it('addRoundResult commits the payload unchanged', () => {
    const commit = vi.fn()
    const payload = { roundNumber: 2, distance: 1400, finishOrder: [2, 1, 0] }

    results.actions.addRoundResult({ commit }, payload)

    expect(commit).toHaveBeenCalledWith('ADD_ROUND_RESULT', payload)
  })

  it('clearResults empties the store through CLEAR_RESULTS', () => {
    const commit = vi.fn()

    results.actions.clearResults({ commit })

    expect(commit).toHaveBeenCalledWith('CLEAR_RESULTS')
  })
})
