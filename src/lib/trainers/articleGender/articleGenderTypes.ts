export type NominativeArticle = 'ο' | 'η' | 'το'

export const NOMINATIVE_ARTICLES: readonly NominativeArticle[] = ['ο', 'η', 'το']

export interface ArticleGenderNoun {
  wordId: string
  greek: string
  russian: string
  article: NominativeArticle
  sourceUrl: string
  noteRu?: string
}
