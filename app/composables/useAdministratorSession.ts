export type AdministratorSession =
  | { status: 'administrator'; userId: string }
  | { status: 'signed-out' }
  | { status: 'not-administrator' }
  | { status: 'error'; message: string }

const sessionVerificationError =
  'Your session could not be verified. Please sign in again.'
const authorizationVerificationError =
  'Your administrator access could not be verified. Please try again.'

export function useAdministratorSession() {
  async function resolveAdministrator(
    userId: string
  ): Promise<AdministratorSession> {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('administrator_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      return { status: 'error', message: authorizationVerificationError }
    }

    if (!data) {
      return { status: 'not-administrator' }
    }

    return { status: 'administrator', userId }
  }

  async function getAdministratorSession(): Promise<AdministratorSession> {
    const supabase = useSupabase()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { status: 'error', message: sessionVerificationError }
    }

    if (!data.session) {
      return { status: 'signed-out' }
    }

    return resolveAdministrator(data.session.user.id)
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<AdministratorSession> {
    const supabase = useSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.session) {
      return {
        status: 'error',
        message:
          'We could not sign you in with those credentials. Check your email and password.'
      }
    }

    const session = await resolveAdministrator(data.session.user.id)

    if (session.status === 'not-administrator') {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        return { status: 'error', message: sessionVerificationError }
      }
    }

    return session
  }

  async function signOut(): Promise<AdministratorSession> {
    const supabase = useSupabase()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        status: 'error',
        message: 'We could not end your session. Please try again.'
      }
    }

    return { status: 'signed-out' }
  }

  return {
    getAdministratorSession,
    signIn,
    signOut
  }
}
