interface RouteScrollLocation {
  path: string
  hash: string
}

interface SavedScrollPosition {
  left?: number
  top?: number
}

export function resolveScrollBehavior(
  to: RouteScrollLocation,
  from: RouteScrollLocation,
  savedPosition: SavedScrollPosition | null,
) {
  if (to.hash) return { el: to.hash }
  if (to.path === from.path) return false
  return savedPosition ?? { top: 0 }
}

export function shouldOpenTheoryExplanation(queryValue: unknown, hash: string): boolean {
  return queryValue === '1' || Boolean(hash)
}
