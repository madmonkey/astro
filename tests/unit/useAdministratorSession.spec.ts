import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdministratorSession } from '~/composables/useAdministratorSession'

const administratorId = '00000000-0000-0000-0000-000000000001'

function mockSupabase({
  profile = null,
  profileError = null,
  session = null,
  sessionError = null,
  signInError = null,
  signInSession = session,
  signOutError = null
}: {
  profile?: { user_id: string } | null
  profileError?: { message: string } | null
  session?: { user: { id: string } } | null
  sessionError?: { message: string } | null
  signInError?: { message: string } | null
  signInSession?: { user: { id: string } } | null
  signOutError?: { message: string } | null
} = {}) {
  const profileQuery = {
    eq: vi.fn(),
    maybeSingle: vi.fn()
  }

  profileQuery.eq.mockReturnValue(profileQuery)
  profileQuery.maybeSingle.mockResolvedValue({
    data: profile,
    error: profileError
  })

  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: session?.user ?? null },
      error: sessionError
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: signInSession },
      error: signInError
    }),
    signOut: vi.fn().mockResolvedValue({ error: signOutError })
  }

  vi.stubGlobal('useSupabase', () => ({
    auth,
    from: vi.fn(() => ({
      select: vi.fn(() => profileQuery)
    }))
  }))

  return { auth }
}

describe('useAdministratorSession', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('identifies visitors without a session as signed out', async () => {
    mockSupabase()

    await expect(
      useAdministratorSession().getAdministratorSession()
    ).resolves.toEqual({ status: 'signed-out' })
  })

  it('recognizes a signed-in allow-listed user as an administrator', async () => {
    mockSupabase({
      profile: { user_id: administratorId },
      session: { user: { id: administratorId } }
    })

    await expect(
      useAdministratorSession().getAdministratorSession()
    ).resolves.toEqual({
      status: 'administrator',
      userId: administratorId
    })
  })

  it('denies a signed-in user who is absent from the administrator allow-list', async () => {
    mockSupabase({
      session: { user: { id: '00000000-0000-0000-0000-000000000002' } }
    })

    await expect(
      useAdministratorSession().getAdministratorSession()
    ).resolves.toEqual({ status: 'not-administrator' })
  })

  it('returns an actionable error for invalid credentials', async () => {
    mockSupabase({
      signInError: { message: 'Invalid login credentials' }
    })

    await expect(
      useAdministratorSession().signIn('admin@example.com', 'incorrect')
    ).resolves.toEqual({
      failedCredentials: true,
      message:
        'We could not sign you in with those credentials. Check your email and password.',
      status: 'error'
    })
  })

  it('ends a non-administrator session after sign-in', async () => {
    const { auth } = mockSupabase({
      signInSession: {
        user: { id: '00000000-0000-0000-0000-000000000002' }
      }
    })

    await expect(
      useAdministratorSession().signIn('member@example.com', 'password')
    ).resolves.toEqual({ status: 'not-administrator' })

    expect(auth.signOut).toHaveBeenCalledOnce()
  })

  it('ends the local administrator session on sign-out', async () => {
    const { auth } = mockSupabase()

    await expect(useAdministratorSession().signOut()).resolves.toEqual({
      status: 'signed-out'
    })

    expect(auth.signOut).toHaveBeenCalledOnce()
  })
})
