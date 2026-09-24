import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? ''
const password = process.env.E2E_ADMIN_PASSWORD ?? ''
const credentialsAvailable = Boolean(email && password)

test.describe('administrator content management', () => {
  test.skip(
    !credentialsAvailable,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run administrator browser tests.'
  )

  test('creates, edits, activates, and deactivates content', async ({
    page
  }) => {
    test.setTimeout(60_000)
    const suffix = Date.now().toString()
    const topicName = `Browser Test Topic ${suffix}`
    const topicSlug = `browser-test-topic-${suffix}`
    const updatedTopicName = `${topicName} Updated`
    const updatedTopicSlug = `${topicSlug}-updated`
    const contentTitle = `Browser Test Content ${suffix}`
    const contentSlug = `browser-test-content-${suffix}`
    const updatedContentTitle = `${contentTitle} Updated`
    const updatedContentSlug = `${contentSlug}-updated`

    async function signIn() {
      await page.goto('/admin')
      await page.getByLabel('Email address').fill(email)
      await page.getByLabel('Password').fill(password)
      await page.getByRole('button', { name: 'Sign in' }).click()
      await expect(
        page.getByRole('link', { name: 'Manage topics' })
      ).toBeVisible()
    }

    async function signOut() {
      await page.goto('/admin')
      await page.getByRole('button', { name: 'Sign out' }).click()
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    }

    await signIn()

    await page.getByRole('link', { name: 'Manage topics' }).click()
    await page.getByLabel('Topic name').fill(topicName)
    await page.getByLabel('URL slug').fill(topicSlug)
    await page.getByRole('button', { name: 'Save topic' }).click()
    await expect(page.locator('.form-success')).toContainText(
      `Created ${topicName}`
    )

    const topicRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: topicName }) })
    await topicRow.getByRole('link', { name: topicName }).click()
    await page.waitForTimeout(1_000)
    await page.getByLabel('Topic name').fill(updatedTopicName)
    await page.getByLabel('URL slug').fill(updatedTopicSlug)
    await expect(page.getByLabel('Topic name')).toHaveValue(updatedTopicName)
    await expect(page.getByLabel('URL slug')).toHaveValue(updatedTopicSlug)
    await page.getByRole('button', { name: 'Save topic' }).click()
    await expect(page.locator('.form-success')).toContainText(
      `Saved ${updatedTopicName}`
    )

    await page.getByRole('link', { name: 'Back to topics' }).click()
    const updatedTopicRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: updatedTopicName }) })
    page.once('dialog', (dialog) => dialog.accept())
    await updatedTopicRow.getByRole('button', { name: 'Activate' }).click()
    await expect(updatedTopicRow.getByText('Active')).toBeVisible()

    await page.getByRole('link', { name: 'Manage content' }).click()
    await page.getByLabel('Title').fill(contentTitle)
    await page.getByLabel('URL slug').fill(contentSlug)
    await page.getByLabel('Topic').selectOption({ label: updatedTopicName })
    await page
      .getByLabel('Markdown content')
      .fill(`# ${contentTitle}\n\nThis content is managed in a browser test.`)
    await page.getByRole('button', { name: 'Save content' }).click()
    await expect(page.locator('.form-success')).toContainText(
      `Created ${contentTitle}`
    )

    const contentRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: contentTitle }) })
    await contentRow.getByRole('link', { name: contentTitle }).click()
    await page.waitForTimeout(1_000)
    await page.getByLabel('Title').fill(updatedContentTitle)
    await page.getByLabel('URL slug').fill(updatedContentSlug)
    await expect(page.getByLabel('Title')).toHaveValue(updatedContentTitle)
    await expect(page.getByLabel('URL slug')).toHaveValue(updatedContentSlug)
    await page.getByRole('button', { name: 'Save content' }).click()
    await expect(page.locator('.form-success')).toContainText(
      `Saved ${updatedContentTitle}`
    )

    await page.getByRole('link', { name: 'Back to content' }).click()
    const updatedContentRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: updatedContentTitle }) })
    page.once('dialog', (dialog) => dialog.accept())
    await updatedContentRow.getByRole('button', { name: 'Activate' }).click()
    await expect(updatedContentRow.getByText('Active')).toBeVisible()

    await signOut()
    await page.goto(`/topics/${updatedTopicSlug}/${updatedContentSlug}`)
    await expect(
      page.getByRole('heading', { name: updatedContentTitle })
    ).toBeVisible()

    await signIn()
    await page.getByRole('link', { name: 'Manage content' }).click()
    const activeContentRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: updatedContentTitle }) })
    page.once('dialog', (dialog) => dialog.accept())
    await activeContentRow.getByRole('button', { name: 'Deactivate' }).click()
    await expect(activeContentRow.getByText('Inactive')).toBeVisible()

    await signOut()
    await page.goto(`/topics/${updatedTopicSlug}/${updatedContentSlug}`)
    await expect(
      page.getByText('This content item is unavailable.')
    ).toBeVisible()
    await expect(
      page.getByText(updatedContentTitle, { exact: true })
    ).not.toBeVisible()
  })

  test('deletes a content item after confirmation', async ({ page }) => {
    const contentTitle = 'Finding Your Rhythm with the Moon'

    await page.goto('/admin')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('link', { name: 'Manage content' }).click()

    const contentRow = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: contentTitle }) })

    page.once('dialog', (dialog) => dialog.accept())
    await contentRow.getByRole('button', { name: 'Delete' }).click()

    await expect(contentRow).toHaveCount(0)

    await page.goto('/admin')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/topics/moon-phases/finding-your-rhythm-with-the-moon')
    await expect(
      page.getByText('This content item is unavailable.')
    ).toBeVisible()
  })
})
