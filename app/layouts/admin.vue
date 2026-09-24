<template>
  <div class="site-shell admin-shell">
    <header class="site-header">
      <NuxtLink class="site-brand" to="/">Astro</NuxtLink>
      <p class="site-tagline">Content administration</p>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <p>Manage the public astrology library.</p>
    </footer>
  </div>
</template>
