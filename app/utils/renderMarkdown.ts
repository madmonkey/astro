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
      img: ['alt', 'height', 'src', 'title', 'width'],
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
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'strong',
      'table',
      'tbody',
      'td',
      'th',
      'thead',
      'tr',
      'ul'
    ],
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https']
    },
    disallowedTagsMode: 'discard'
  })
}
