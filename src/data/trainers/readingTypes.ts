export type ReadingLevel = 'A1' | 'A2'

export type ReadingGenreId =
  | 'message'
  | 'notice'
  | 'classified-ad'
  | 'daily-story'
  | 'timetable'
  | 'invitation'
  | 'email'
  | 'work-notice'
  | 'service-notice'
  | 'instructions'
  | 'rental-listing'
  | 'event-poster'
  | 'personal-story'
  | 'library-message'

export type ReadingSkillId =
  | 'main-idea'
  | 'specific-information'
  | 'link-facts'
  | 'cause-effect'
  | 'sequence'
  | 'purpose'
  | 'direct-inference'

export interface ReadingOption {
  id: string
  textRu: string
  feedbackRu: string
}

export interface ReadingQuestion {
  id: string
  skillId: ReadingSkillId
  promptRu: string
  options: ReadingOption[]
  correctOptionId: string
  explanationRu: string
  evidenceEl: string[]
}

export interface ReadingText {
  id: string
  level: ReadingLevel
  genreId: ReadingGenreId
  titleRu: string
  greek: string
  translationRu: string
  questions: ReadingQuestion[]
}
