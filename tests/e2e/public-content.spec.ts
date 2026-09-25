import { expect, test } from '@playwright/test'

test.describe('public content browsing', () => {
  test('shows active topics and published content to a signed-out visitor', async ({
    page
  }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Moon Phases' })).toBeVisible()

    await page.getByRole('link', { name: 'Moon Phases' }).click()

    await expect(
      page.getByRole('link', { name: 'Finding Your Rhythm with the Moon' })
    ).toBeVisible()
    await expect(
      page.getByText('New Moon Reflection Prompts')
    ).not.toBeVisible()
  })

  test('shows an unavailable state for an inactive content direct link', async ({
    page
  }) => {
    await page.goto('/topics/moon-phases/new-moon-reflection-prompts')

    await expect(
      page.getByText('This content item is unavailable.')
    ).toBeVisible()
    await expect(
      page.getByText('New Moon Reflection Prompts')
    ).not.toBeVisible()
  })

  test('renders published Markdown content without raw HTML', async ({
    page
  }) => {
    await page.goto('/topics/moon-phases/finding-your-rhythm-with-the-moon')

    await expect(
      page.getByRole('heading', { name: 'Finding Your Rhythm with the Moon' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Learn more about lunar cycles' })
    ).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Lunar_phase')
  })

  test('shows an empty state for an active topic without published content', async ({
    page
  }) => {
    await page.goto('/topics/planetary-basics')

    await expect(page.getByText('No published content yet')).toBeVisible()
  })

  test('keeps rendered Markdown within a Galaxy S26 viewport', async ({
    page
  }) => {
    await page.setViewportSize({ height: 780, width: 360 })

    await page.goto('/topics/zodiac-signs/a-gentle-introduction-to-the-zodiac')
    await expect(
      page.getByRole('heading', {
        name: 'A Gentle Introduction to the Zodiac'
      })
    ).toBeVisible()

    await page.locator('.markdown-content').evaluate((element) => {
      element.innerHTML = `
        <p>https://example.com/${'long-path-segment-'.repeat(30)}</p>
        <pre><code>${'const lunarCycle = '.repeat(20)}</code></pre>
        <table><tbody><tr><td>${'Wide table cell '.repeat(20)}</td></tr></tbody></table>
      `
    })

    await expect
      .poll(() =>
        page
          .locator('html')
          .evaluate((element) => element.scrollWidth === element.clientWidth)
      )
      .toBe(true)
  })
})
