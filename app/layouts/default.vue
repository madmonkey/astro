<template>
  <div class="site-shell">
    <header class="site-header">
      <NuxtLink class="site-brand" to="/">Astro</NuxtLink>
      <p class="site-tagline">Astrology, thoughtfully written.</p>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <p>Explore the patterns that shape your sky.</p>
    </footer>
  </div>
</template>
