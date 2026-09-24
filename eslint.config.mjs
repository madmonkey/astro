import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt().append({
  rules: {
    'vue/html-self-closing': [
      'error',
      {
        html: {
          component: 'always',
          normal: 'always',
          void: 'always'
        },
        math: 'always',
        svg: 'always'
      }
    ]
  }
})
