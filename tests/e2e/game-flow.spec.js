import { expect, test } from '@playwright/test'

test('completes the full game flow and renders six result rounds', async ({
  page,
}) => {
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
