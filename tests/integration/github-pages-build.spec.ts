import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const outputDirectory = resolve('.output/public')

describe('GitHub Pages build artifact', () => {
  it('contains static entry and fallback pages with repository-path assets', async () => {
    const indexPath = resolve(outputDirectory, 'index.html')
    const fallbackPath = resolve(outputDirectory, '404.html')

    expect(existsSync(indexPath)).toBe(true)
    expect(existsSync(fallbackPath)).toBe(true)
    expect(existsSync(resolve(outputDirectory, '_nuxt'))).toBe(true)

    await expect(readFile(indexPath, 'utf8')).resolves.toContain(
      '/astro/_nuxt/'
    )
    await expect(readFile(fallbackPath, 'utf8')).resolves.toContain(
      '/astro/_nuxt/'
    )
  })
})
