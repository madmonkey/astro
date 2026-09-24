import { marked, Renderer } from 'marked'
import sanitizeHtml from 'sanitize-html'

const renderer = new Renderer()

renderer.html = () => ''

export function renderMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, {
    async: false,
    renderer
  })

  return sanitizeHtml(rendered, {
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class'],
      ol: ['start']
    },
    allowedTags: [
      'a',
      'blockquote',
      'br',
      'code',
      'del',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'li',
      'ol',
      'p',
      'pre',
      'strong',
      'ul'
    ],
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard'
  })
}
