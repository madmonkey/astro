import { expect, test, type Page } from '@playwright/test'

const administratorEmail = process.env.E2E_ADMIN_EMAIL ?? ''
const administratorPassword = process.env.E2E_ADMIN_PASSWORD ?? ''
const nonAdministratorEmail = process.env.E2E_NON_ADMIN_EMAIL ?? ''
const nonAdministratorPassword = process.env.E2E_NON_ADMIN_PASSWORD ?? ''
const administratorCredentialsAvailable = Boolean(
  administratorEmail && administratorPassword
)
const nonAdministratorCredentialsAvailable = Boolean(
  nonAdministratorEmail && nonAdministratorPassword
)

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/admin')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('administrator authentication', () => {
  test.describe.configure({ mode: 'serial' })

  test('redirects a signed-out visitor away from protected administration routes', async ({
    page
  }) => {
    await page.goto('/admin/topics')

    await expect(page).toHaveURL(/\/admin\?reason=sign-in-required$/)
    await expect(
      page.getByText('Sign in to continue to content management.')
    ).toBeVisible()
  })

  test('shows an actionable error for invalid credentials', async ({
    page
  }) => {
    await signIn(page, 'invalid-admin@local.astro.test', 'incorrect-password')

    await expect(
      page.getByText(
        'We could not sign you in with those credentials. Check your email and password.'
      )
    ).toBeVisible()
  })

  test('denies an authenticated account that is absent from the administrator allow-list', async ({
    page
  }) => {
    test.skip(
      !nonAdministratorCredentialsAvailable,
      'Set E2E_NON_ADMIN_EMAIL and E2E_NON_ADMIN_PASSWORD to run this allow-list denial test.'
    )

    await signIn(page, nonAdministratorEmail, nonAdministratorPassword)

    await expect(
      page.getByText('This account is not authorized to manage content.')
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Manage topics' })
    ).not.toBeVisible()
  })

  test('allows an administrator to access management and sign out', async ({
    page
  }) => {
    test.skip(
      !administratorCredentialsAvailable,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run administrator browser tests.'
    )

    await signIn(page, administratorEmail, administratorPassword)

    await expect(
      page.getByRole('link', { name: 'Manage topics' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()

    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

    await page.goto('/admin/topics')
    await expect(page).toHaveURL(/\/admin\?reason=sign-in-required$/)
  })

  test('denies access after the administrator session expires', async ({
    page
  }) => {
    test.skip(
      !administratorCredentialsAvailable,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run administrator browser tests.'
    )

    await signIn(page, administratorEmail, administratorPassword)
    await expect(
      page.getByRole('link', { name: 'Manage topics' })
    ).toBeVisible()

    await page.evaluate(() => window.localStorage.clear())
    await page.goto('/admin/topics')

    await expect(page).toHaveURL(/\/admin\?reason=sign-in-required$/)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })
})
