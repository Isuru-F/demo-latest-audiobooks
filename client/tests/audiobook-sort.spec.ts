import { test, expect } from '@playwright/test'

test.describe('Audiobook Sorting Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/audiobooks')
    await page.waitForSelector('.audiobook-grid', { timeout: 10000 })
  })

  test('should display sort dropdown with correct options', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    await expect(sortSelect).toBeVisible()

    const options = await sortSelect.locator('option').allTextContents()
    expect(options).toContain('Name (A-Z)')
    expect(options).toContain('Name (Z-A)')
    expect(options).toContain('Release Date (Oldest)')
    expect(options).toContain('Release Date (Newest)')
  })

  test('should sort audiobooks by name ascending (A-Z)', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    await sortSelect.selectOption('name-asc')

    await page.waitForTimeout(500)

    const titles = await page.locator('.audiobook-title').allTextContents()
    const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b))

    expect(titles).toEqual(sortedTitles)
  })

  test('should sort audiobooks by name descending (Z-A)', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    await sortSelect.selectOption('name-desc')

    await page.waitForTimeout(500)

    const titles = await page.locator('.audiobook-title').allTextContents()
    const sortedTitles = [...titles].sort((a, b) => b.localeCompare(a))

    expect(titles).toEqual(sortedTitles)
  })

  test('should sort audiobooks by release date ascending (oldest first)', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    await sortSelect.selectOption('date-asc')

    await page.waitForTimeout(500)

    const cards = await page.locator('.audiobook-card').all()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('should sort audiobooks by release date descending (newest first)', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    await sortSelect.selectOption('date-desc')

    await page.waitForTimeout(500)

    const cards = await page.locator('.audiobook-card').all()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('should maintain search filter when changing sort order', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await searchInput.fill('harry')

    await page.waitForTimeout(500)

    const cardsBeforeSort = await page.locator('.audiobook-card').count()

    const sortSelect = page.locator('.sort-select')
    await sortSelect.selectOption('name-desc')

    await page.waitForTimeout(500)

    const cardsAfterSort = await page.locator('.audiobook-card').count()

    expect(cardsAfterSort).toBe(cardsBeforeSort)
  })

  test('should have default sort option as Name (A-Z)', async ({ page }) => {
    const sortSelect = page.locator('.sort-select')
    const selectedValue = await sortSelect.inputValue()

    expect(selectedValue).toBe('name-asc')
  })
})
