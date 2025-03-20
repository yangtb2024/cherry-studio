/**
 * 获取给定日期的开始时间（00:00:00）
 * @param date 日期
 * @returns 当天开始时间
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取给定日期所在周的开始时间（周一的00:00:00）
 * @param date 日期
 * @returns 当周开始时间
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // 调整为周一为一周的开始
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取给定日期所在月的开始时间（1日00:00:00）
 * @param date 日期
 * @returns 当月开始时间
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取给定日期所在年的开始时间（1月1日00:00:00）
 * @param date 日期
 * @returns 当年开始时间
 */
export function getStartOfYear(date: Date): Date {
  const result = new Date(date)
  result.setMonth(0, 1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取两个日期之间的所有日期（包括开始日期和结束日期）
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期数组
 */
export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const start = getStartOfDay(startDate)
  const end = getStartOfDay(endDate)
  
  // 如果开始日期大于结束日期，则返回空数组
  if (start > end) {
    return dates
  }
  
  // 添加所有日期
  const currentDate = new Date(start)
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * 获取两个日期之间的天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数
 */
export function getDaysDiff(startDate: Date, endDate: Date): number {
  const start = getStartOfDay(startDate)
  const end = getStartOfDay(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 格式化日期为 YYYY-MM-DD HH:MM:SS 格式
 * @param date 日期
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${date.toTimeString().substring(0, 8)}`
}
