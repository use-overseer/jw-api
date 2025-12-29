export const getMondayOfWeek = (year: number, week: number): Date => {
  const d = new Date(Date.UTC(year, 0, 4))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1 + (week - 1) * 7)
  return d
}

export const getWeekNumber = (day: number, month: number, year: number): number => {
  // month is 1-based (1 = January)
  const date = new Date(Date.UTC(year, month - 1, day))

  // ISO week date weeks start on Monday, so correct the day number
  const dayOfWeek = date.getUTCDay() || 7 // Sunday = 7
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)

  // Calculate week number
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  return weekNumber
}
