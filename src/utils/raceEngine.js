export function computeFinishOrder(horses) {
  if (!horses || horses.length === 0) return []

  const pool = horses.map((horse, index) => ({
    index,
    weight: horse.condition,
  }))

  const result = []

  while (pool.length > 0) {
    const totalWeight = pool.reduce((sum, h) => sum + h.weight, 0)
    let random = Math.random() * totalWeight

    let selectedIdx = 0
    for (let i = 0; i < pool.length; i++) {
      random -= pool[i].weight
      if (random <= 0) {
        selectedIdx = i
        break
      }
    }

    result.push(pool[selectedIdx].index)
    pool.splice(selectedIdx, 1)
  }

  return result
}
