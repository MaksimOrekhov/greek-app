export type DialogueLevel = 'A1' | 'A2'

export interface DialogueLine {
  speaker: string
  greek: string
  translation: string
}

export interface DialogueOption {
  id: string
  greek: string
  translation: string
  explanation: string
}

export interface DialogueQuestion {
  id: string
  level: DialogueLevel
  categoryId: string
  situationId: string
  intentId: string
  context: DialogueLine[]
  options: DialogueOption[]
  correctOptionId: string
  explanation: string
}
