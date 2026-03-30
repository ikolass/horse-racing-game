import { computeFinishOrder } from '@/utils/raceEngine.js'

describe('computeFinishOrder', () => {
  it('returns a permutation of every horse index without duplicates', () => {
    const horses = [
      { condition: 10 },
      { condition: 20 },
      { condition: 30 },
      { condition: 40 },
    ]

    const result = computeFinishOrder(horses)

    expect(result).toHaveLength(horses.length)
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('places the highest-condition horse in the top 3 more than 30 times across 50 simulations', () => {
    const horses = [
      { condition: 100 },
      { condition: 40 },
      { condition: 35 },
      { condition: 30 },
      { condition: 25 },
      { condition: 20 },
      { condition: 15 },
      { condition: 10 },
      { condition: 8 },
      { condition: 5 },
    ]

    let topThreeFinishes = 0

    for (let i = 0; i < 50; i += 1) {
      const result = computeFinishOrder(horses)
      if (result.indexOf(0) <= 2) {
        topThreeFinishes += 1
      }
    }

    expect(topThreeFinishes).toBeGreaterThan(30)
  })
})
