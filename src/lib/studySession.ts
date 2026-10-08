export function nextPosition(current: number, total: number) {
  return Math.min(total, Math.max(0, current + 1))
}

export function sessionProgress(reviewed: number, total: number) {
  const completed = total > 0 ? Math.min(total, Math.max(0, reviewed)) : 0
  return { completed, total: Math.max(0, total), percent: total > 0 ? completed / total * 100 : 100 }
}
