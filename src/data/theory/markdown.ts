import MarkdownIt from 'markdown-it'

const parser = new MarkdownIt({ html: false, linkify: false, typographer: false })
parser.renderer.rules.heading_open = (tokens, index, options, _env, renderer) => {
  const heading = tokens[index + 1]?.content ?? ''
  const id = heading.toLocaleLowerCase('ru').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
  tokens[index].attrSet('id', id)
  return renderer.renderToken(tokens, index, options)
}
parser.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n'
parser.renderer.rules.table_close = () => '</table></div>\n'

export function renderTheoryMarkdown(source: string): string {
  return parser.render(source)
}
