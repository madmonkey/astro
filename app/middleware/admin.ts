export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const session = await useAdministratorSession().getAdministratorSession()

  if (session.status === 'administrator') {
    return
  }

  return navigateTo({
    path: '/admin',
    query: {
      reason:
        session.status === 'not-administrator'
          ? 'access-denied'
          : 'sign-in-required'
    }
  })
})
