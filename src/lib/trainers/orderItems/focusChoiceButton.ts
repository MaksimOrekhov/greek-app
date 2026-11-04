interface FocusableChoiceButton {
  focus(): void
}

export function registerOrderItemsChoiceButton<T extends FocusableChoiceButton>(
  buttons: Map<string, T>,
  itemId: string,
  button: T | null,
): void {
  if (button) buttons.set(itemId, button)
  else buttons.delete(itemId)
}

export function focusOrderItemsChoiceButton<T extends FocusableChoiceButton>(
  buttons: ReadonlyMap<string, T>,
  itemId: string,
): boolean {
  const button = buttons.get(itemId)
  if (!button) return false
  button.focus()
  return true
}
