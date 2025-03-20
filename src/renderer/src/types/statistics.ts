// 统计数据类型定义
export type StatisticsTimeRange = 'daily' | 'weekly' | 'monthly' | 'all_time'

// 基础使用统计
export interface UsageStats {
  totalSessions: number // 总会话数
  totalMessages: number // 总消息数
  userMessages: number // 用户消息数
  assistantMessages: number // 助手消息数
  avgSessionLength: number // 平均会话长度
  totalUsageTime: number // 总使用时长（分钟）
  activeUsers: number // 活跃用户数
}

// 单个模型的使用统计
export interface ModelUsageStat {
  id: string // 模型ID
  name: string // 模型名称
  count: number // 使用次数
  avgResponseTime: number // 平均响应时间（毫秒）
  avgResponseLength: number // 平均响应长度（字符数）
  errorRate: number // 错误率（0-1）
  tokenUsage: number // token使用量
}

// 模型使用统计
export interface ModelStats {
  totalCalls: number // 总调用次数
  modelUsage: Record<string, ModelUsageStat> // 各模型使用情况
}

// 时间统计项（按小时或日期）
export interface TimeDataPoint {
  timestamp: string // 时间戳
  count: number // 消息数量
}

// 时间趋势分析
export interface TimeStats {
  usageByHour: TimeDataPoint[] // 按小时的使用情况
  usageByDay: TimeDataPoint[] // 按天的使用情况
  usageByWeek: TimeDataPoint[] // 按周的使用情况
  usageByMonth: TimeDataPoint[] // 按月的使用情况
  peakUsageTime: string // 使用高峰时段
}

// 内容分析中的标签项
export interface TopicTag {
  name: string // 标签名称
  count: number // 出现次数
}

// 内容分析
export interface ContentStats {
  topTopics: TopicTag[] // 热门话题
  keywords: TopicTag[] // 关键词
  sessionLengthDistribution: number[] // 会话长度分布（各长度的会话数量）
}

// 资源使用统计
export interface ResourceStats {
  totalApiCalls: number // API总调用次数
  totalTokenUsage: number // 总Token使用量
  tokenUsageByModel: Record<string, number> // 各模型Token使用情况
  knowledgeBaseUsage: Record<string, number> // 知识库使用情况
}

// 完整的统计数据
export interface StatisticsData {
  id: string // 唯一标识符
  date: string // 日期
  type: StatisticsTimeRange // 统计类型（天/周/月/全部）
  data: {
    usage?: UsageStats // 使用情况
    models?: ModelStats // 模型统计
    time?: TimeStats // 时间趋势
    content?: ContentStats // 内容分析
    resources?: ResourceStats // 资源使用
  }
}
