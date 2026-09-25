import { Marked, Renderer } from 'marked'
import markedFootnote from 'marked-footnote'
import sanitizeHtml from 'sanitize-html'

const renderer = new Renderer()

renderer.html = () => ''

const markdown = new Marked({
  async: false,
  renderer
}).use(
  markedFootnote({
    footnoteDivider: true,
    refMarkers: true
  })
)

export function renderMarkdown(source: string): string {
  const rendered = markdown.parse(source, { async: false })

  return sanitizeHtml(rendered, {
    allowedAttributes: {
      a: [
        'aria-describedby',
        'aria-label',
        'data-footnote-backref',
        'data-footnote-ref',
        'href',
        'id',
        'title'
      ],
      code: ['class'],
      h2: ['class', 'id'],
      img: ['alt', 'height', 'src', 'title', 'width'],
      ol: ['start'],
      section: ['class', 'data-footnotes'],
      li: ['id']
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
      'section',
      'strong',
      'sup',
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
