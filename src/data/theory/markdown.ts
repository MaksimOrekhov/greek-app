import MarkdownIt from 'markdown-it'

export type TheoryMarkdownSection = 'article' | 'summary' | 'explanation'

export function renderTheoryMarkdown(source: string, section: TheoryMarkdownSection = 'article'): string {
  const parser = new MarkdownIt({ html: false, linkify: false, typographer: false })
  const usedIds = new Map<string, number>()
  parser.renderer.rules.heading_open = (tokens, index, options, _env, renderer) => {
    const heading = tokens[index + 1]?.content ?? ''
    const slug = heading.toLocaleLowerCase('ru').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section'
    const baseId = `${section}-${slug}`
    const occurrence = (usedIds.get(baseId) ?? 0) + 1
    usedIds.set(baseId, occurrence)
    tokens[index].attrSet('id', occurrence === 1 ? baseId : `${baseId}-${occurrence}`)
    return renderer.renderToken(tokens, index, options)
  }
  parser.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n'
  parser.renderer.rules.table_close = () => '</table></div>\n'
  return parser.render(source)
}
