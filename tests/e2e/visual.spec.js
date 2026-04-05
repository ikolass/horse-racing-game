import { expect, test } from '@playwright/test'

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
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
  })

  test('home screen stays stable', async ({ page }) => {
    await expect(page.locator('body')).toHaveScreenshot('home-screen.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('generated schedule layout stays stable', async ({ page }) => {
    await page.getByTestId('btn-generate').click()

    await expect(page.locator('body')).toHaveScreenshot(
      'generated-schedule.png',
      {
        animations: 'disabled',
        fullPage: true,
      }
    )
  })
})
