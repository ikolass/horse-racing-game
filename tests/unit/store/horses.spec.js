import horses from '@/store/modules/horses.js'

describe('horses module', () => {
  it('exposes 20 horses with unique names, unique colors, and bounded conditions', () => {
    const state = horses.state()
    const names = state.list.map((horse) => horse.name)
    const colors = state.list.map((horse) => horse.color)
    const conditions = state.list.map((horse) => horse.condition)

    expect(state.list).toHaveLength(20)
    expect(new Set(names).size).toBe(20)
    expect(new Set(colors).size).toBe(20)
    conditions.forEach((condition) => {
      expect(condition).toBeGreaterThanOrEqual(1)
      expect(condition).toBeLessThanOrEqual(100)
    })
  })
})
