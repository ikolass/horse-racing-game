import { expect, test } from '@playwright/test'

test('completes the full game flow and renders six result rounds', async ({
  page,
}) => {
  await page.addInitScript(({ seed }) => {
    const random = (() => {
      let state = seed >>> 0

      return () => {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
      }
    })()

    Math.random = random
  }, { seed: 123456 })

  await page.goto('/?e2e=1')

  const generateButton = page.locator('[data-testid="btn-generate"]')
  const startButton = page.locator('[data-testid="btn-start"]')
  const resultsPanel = page.locator('[data-testid="results-panel"]')

  await generateButton.click()
  await expect(startButton).toBeEnabled()

  await startButton.click()

  for (let round = 1; round <= 6; round += 1) {
    await expect(
      page.locator(`[data-testid="result-round-${round}"]`)
    ).toBeVisible({
      timeout: 60000,
    })
  }

  const resultCards = resultsPanel.locator('[data-testid^="result-round-"]')

  await expect(resultCards).toHaveCount(6)

  for (let round = 1; round <= 6; round += 1) {
    await expect(
      page.locator(`[data-testid="result-round-${round}"]`)
    ).toBeVisible()
  }
})

test('clears previous round finish labels when the next round starts', async ({
  page,
}) => {
  await page.addInitScript(({ seed }) => {
    const random = (() => {
      let state = seed >>> 0

      return () => {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
      }
    })()

    Math.random = random
  }, { seed: 123456 })

  await page.goto('/?e2e=1')
  await page.getByTestId('btn-generate').click()
  await page.getByTestId('btn-start').click()

  await expect(page.getByTestId('result-round-1')).toContainText('Finished', {
    timeout: 60000,
  })
  await expect(page.getByTestId('round-header')).toContainText('Round 2')

  const finishLabels = page.locator('.finish-position')

  await expect(finishLabels).toHaveCount(0)
})
