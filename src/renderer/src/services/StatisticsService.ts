import db from '@renderer/databases'
import {
  ContentStats,
  Message,
  ModelStats,
  ResourceStats,
  StatisticsData,
  StatisticsTimeRange,
  TimeStats,
  UsageStats
} from '@renderer/types'
import { getDaysBetween, getStartOfDay, getStartOfMonth, getStartOfWeek } from '@renderer/utils/date'
import { cloneDeep } from 'lodash'

/**
 * 统计服务类，用于处理统计数据的收集、计算和存储
 */
class StatisticsService {
  /**
   * 获取指定时间范围的统计数据
   * @param range 时间范围
   * @returns 统计数据
   */
  async getStatistics(range: StatisticsTimeRange = 'daily'): Promise<StatisticsData | null> {
    try {
      const stats = await db.statistics.get(range)
      if (!stats) {
        // 初始化一个空的统计数据
        const newStats = this.createEmptyStatistics(range)
        await db.statistics.put(newStats)
        return newStats
      }

      // 如果日期不是今天，则需要更新
      if (range === 'daily' && stats.date !== new Date().toISOString().split('T')[0]) {
        // 保存昨天的数据到历史记录
        await this.saveHistoricalData(stats)
        
        // 创建今天的新数据
        const todayStats = this.createEmptyStatistics('daily')
        await db.statistics.put(todayStats)
        return todayStats
      }
      
      // 周数据更新
      if (range === 'weekly' && new Date(stats.date).getDay() !== new Date().getDay()) {
        const lastWeekStart = getStartOfWeek(new Date(stats.date))
        const thisWeekStart = getStartOfWeek(new Date())
        
        if (lastWeekStart.getTime() !== thisWeekStart.getTime()) {
          // 保存上周数据
          await this.saveHistoricalData(stats)
          
          // 创建本周数据
          const weeklyStats = this.createEmptyStatistics('weekly')
          await db.statistics.put(weeklyStats)
          return weeklyStats
        }
      }
      
      // 月数据更新
      if (range === 'monthly' && new Date(stats.date).getMonth() !== new Date().getMonth()) {
        // 保存上月数据
        await this.saveHistoricalData(stats)
        
        // 创建本月数据
        const monthlyStats = this.createEmptyStatistics('monthly')
        await db.statistics.put(monthlyStats)
        return monthlyStats
      }
      
      return stats
    } catch (error) {
      console.error('获取统计数据失败', error)
      return null
    }
  }

  /**
   * 保存历史统计数据
   * @param stats 统计数据
   */
  private async saveHistoricalData(stats: StatisticsData): Promise<void> {
    try {
      // 历史数据使用日期作为ID
      const historicalStats = cloneDeep(stats)
      historicalStats.id = `history_${stats.type}_${stats.date}`
      
      await db.statistics.put(historicalStats)
    } catch (error) {
      console.error('保存历史统计数据失败', error)
    }
  }

  /**
   * 创建空的统计数据
   * @param range 统计范围
   * @returns 空的统计数据
   */
  private createEmptyStatistics(range: StatisticsTimeRange): StatisticsData {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      id: range,
      date: today,
      type: range,
      data: {
        usage: this.createEmptyUsageStats(),
        models: this.createEmptyModelStats(),
        time: this.createEmptyTimeStats(),
        content: this.createEmptyContentStats(),
        resources: this.createEmptyResourceStats()
      }
    }
  }

  /**
   * 创建空的使用情况统计
   * @returns 使用情况统计
   */
  private createEmptyUsageStats(): UsageStats {
    return {
      totalSessions: 0,
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      avgSessionLength: 0,
      totalUsageTime: 0,
      activeUsers: 1 // 默认当前用户
    }
  }

  /**
   * 创建空的模型统计
   * @returns 模型统计
   */
  private createEmptyModelStats(): ModelStats {
    return {
      totalCalls: 0,
      modelUsage: {}
    }
  }

  /**
   * 创建空的时间统计
   * @returns 时间统计
   */
  private createEmptyTimeStats(): TimeStats {
    return {
      usageByHour: Array.from({ length: 24 }, (_, i) => ({
        timestamp: i.toString().padStart(2, '0'),
        count: 0
      })),
      usageByDay: Array.from({ length: 7 }, (_, i) => ({
        timestamp: i.toString(),
        count: 0
      })),
      usageByWeek: [],
      usageByMonth: Array.from({ length: 12 }, (_, i) => ({
        timestamp: (i + 1).toString(),
        count: 0
      })),
      peakUsageTime: ''
    }
  }

  /**
   * 创建空的内容统计
   * @returns 内容统计
   */
  private createEmptyContentStats(): ContentStats {
    return {
      topTopics: [],
      keywords: [],
      sessionLengthDistribution: Array(10).fill(0) // 0-10, 11-20, ...
    }
  }

  /**
   * 创建空的资源统计
   * @returns 资源统计
   */
  private createEmptyResourceStats(): ResourceStats {
    return {
      totalApiCalls: 0,
      totalTokenUsage: 0,
      tokenUsageByModel: {},
      knowledgeBaseUsage: {}
    }
  }

  /**
   * 更新消息统计
   * @param message 消息
   */
  async updateMessageStats(message: Message): Promise<void> {
    try {
      // 获取当前统计数据
      const dailyStats = await this.getStatistics('daily')
      const weeklyStats = await this.getStatistics('weekly')
      const monthlyStats = await this.getStatistics('monthly')
      const allTimeStats = await this.getStatistics('all_time')
      
      if (!dailyStats || !weeklyStats || !monthlyStats || !allTimeStats) {
        console.error('获取统计数据失败')
        return
      }
      
      // 更新不同时间范围的统计数据
      await Promise.all([
        this.updateMessageStatsForRange(dailyStats, message),
        this.updateMessageStatsForRange(weeklyStats, message),
        this.updateMessageStatsForRange(monthlyStats, message),
        this.updateMessageStatsForRange(allTimeStats, message)
      ])
    } catch (error) {
      console.error('更新消息统计失败', error)
    }
  }

  /**
   * 更新特定时间范围的消息统计
   * @param stats 统计数据
   * @param message 消息
   */
  private async updateMessageStatsForRange(stats: StatisticsData, message: Message): Promise<void> {
    try {
      const { data } = stats
      const usage = data.usage!
      const models = data.models!
      const time = data.time!
      const resources = data.resources!
      
      // 更新消息总数
      usage.totalMessages++
      
      // 更新用户/助手消息数
      if (message.role === 'user') {
        usage.userMessages++
      } else if (message.role === 'assistant') {
        usage.assistantMessages++
        
        // 更新模型使用统计
        if (message.model) {
          this.updateModelStats(models, message)
        }
        
        // 更新资源使用统计
        if (message.usage) {
          this.updateResourceStats(resources, message)
        }
      }
      
      // 更新时间统计
      this.updateTimeStats(time, message)
      
      // 保存更新后的统计数据
      await db.statistics.put(stats)
    } catch (error) {
      console.error('更新特定时间范围的消息统计失败', error)
    }
  }

  /**
   * 更新模型统计
   * @param modelStats 模型统计
   * @param message 消息
   */
  private updateModelStats(modelStats: ModelStats, message: Message): void {
    try {
      const model = message.model
      if (!model) return
      
      // 更新总调用次数
      modelStats.totalCalls++
      
      // 获取或创建模型使用统计
      const modelId = model.id
      let modelUsage = modelStats.modelUsage[modelId]
      
      if (!modelUsage) {
        modelUsage = {
          id: modelId,
          name: model.name,
          count: 0,
          avgResponseTime: 0,
          avgResponseLength: 0,
          errorRate: 0,
          tokenUsage: 0
        }
        modelStats.modelUsage[modelId] = modelUsage
      }
      
      // 更新模型使用次数
      modelUsage.count++
      
      // 更新响应时间
      if (message.metrics?.time_completion_millsec) {
        const prevTotal = modelUsage.avgResponseTime * (modelUsage.count - 1)
        modelUsage.avgResponseTime = (prevTotal + message.metrics.time_completion_millsec) / modelUsage.count
      }
      
      // 更新响应长度
      const responseLength = message.content.length
      const prevLengthTotal = modelUsage.avgResponseLength * (modelUsage.count - 1)
      modelUsage.avgResponseLength = (prevLengthTotal + responseLength) / modelUsage.count
      
      // 更新错误率
      if (message.status === 'error') {
        const errorCount = modelUsage.errorRate * (modelUsage.count - 1) + 1
        modelUsage.errorRate = errorCount / modelUsage.count
      }
      
      // 更新Token使用量
      if (message.usage?.completion_tokens) {
        modelUsage.tokenUsage += message.usage.completion_tokens
      } else if (message.metrics?.completion_tokens) {
        modelUsage.tokenUsage += message.metrics.completion_tokens
      }
    } catch (error) {
      console.error('更新模型统计失败', error)
    }
  }

  /**
   * 更新时间统计
   * @param timeStats 时间统计
   * @param message 消息
   */
  private updateTimeStats(timeStats: TimeStats, message: Message): void {
    try {
      const date = new Date(message.createdAt)
      const hour = date.getHours()
      const day = date.getDay() // 0-6, 0表示周日
      const month = date.getMonth() // 0-11
      
      // 更新按小时统计
      const hourIndex = timeStats.usageByHour.findIndex(
        item => item.timestamp === hour.toString().padStart(2, '0')
      )
      if (hourIndex >= 0) {
        timeStats.usageByHour[hourIndex].count++
      }
      
      // 更新按天统计
      const dayIndex = timeStats.usageByDay.findIndex(
        item => item.timestamp === day.toString()
      )
      if (dayIndex >= 0) {
        timeStats.usageByDay[dayIndex].count++
      }
      
      // 更新按月统计
      const monthIndex = timeStats.usageByMonth.findIndex(
        item => item.timestamp === (month + 1).toString()
      )
      if (monthIndex >= 0) {
        timeStats.usageByMonth[monthIndex].count++
      }
      
      // 计算使用高峰时段
      const peakHourData = [...timeStats.usageByHour].sort((a, b) => b.count - a.count)[0]
      if (peakHourData) {
        const peakHour = parseInt(peakHourData.timestamp)
        timeStats.peakUsageTime = `${peakHour}:00 - ${peakHour + 1}:00`
      }
    } catch (error) {
      console.error('更新时间统计失败', error)
    }
  }

  /**
   * 更新资源使用统计
   * @param resourceStats 资源使用统计
   * @param message 消息
   */
  private updateResourceStats(resourceStats: ResourceStats, message: Message): void {
    try {
      // 更新API调用次数
      resourceStats.totalApiCalls++
      
      // 更新Token使用量
      let tokenUsage = 0
      if (message.usage?.completion_tokens) {
        tokenUsage = message.usage.completion_tokens
      } else if (message.metrics?.completion_tokens) {
        tokenUsage = message.metrics.completion_tokens
      }
      
      if (tokenUsage > 0) {
        resourceStats.totalTokenUsage += tokenUsage
        
        // 更新按模型的Token使用量
        if (message.model) {
          const modelId = message.model.id
          resourceStats.tokenUsageByModel[modelId] = 
            (resourceStats.tokenUsageByModel[modelId] || 0) + tokenUsage
        }
      }
      
      // 更新知识库使用情况
      if (message.knowledgeBaseIds && message.knowledgeBaseIds.length > 0) {
        for (const kbId of message.knowledgeBaseIds) {
          resourceStats.knowledgeBaseUsage[kbId] = 
            (resourceStats.knowledgeBaseUsage[kbId] || 0) + 1
        }
      }
    } catch (error) {
      console.error('更新资源使用统计失败', error)
    }
  }
  
  /**
   * 更新话题统计
   * @param topicId 话题ID
   */
  async updateTopicStats(topicId: string): Promise<void> {
    try {
      // 获取话题数据
      const topic = await db.topics.get(topicId)
      if (!topic) return
      
      // 获取当前统计数据
      const dailyStats = await this.getStatistics('daily')
      const weeklyStats = await this.getStatistics('weekly')
      const monthlyStats = await this.getStatistics('monthly')
      const allTimeStats = await this.getStatistics('all_time')
      
      if (!dailyStats || !weeklyStats || !monthlyStats || !allTimeStats) {
        console.error('获取统计数据失败')
        return
      }
      
      // 更新不同时间范围的统计数据
      await Promise.all([
        this.updateTopicStatsForRange(dailyStats, topic),
        this.updateTopicStatsForRange(weeklyStats, topic),
        this.updateTopicStatsForRange(monthlyStats, topic),
        this.updateTopicStatsForRange(allTimeStats, topic)
      ])
    } catch (error) {
      console.error('更新话题统计失败', error)
    }
  }
  
  /**
   * 更新特定时间范围的话题统计
   * @param stats 统计数据
   * @param topic 话题
   */
  private async updateTopicStatsForRange(stats: StatisticsData, topic: any): Promise<void> {
    try {
      const { data } = stats
      const usage = data.usage!
      const content = data.content!
      
      // 更新会话总数
      usage.totalSessions++
      
      // 更新平均会话长度
      const sessionLength = topic.messages.length
      const prevTotalLength = usage.avgSessionLength * (usage.totalSessions - 1)
      usage.avgSessionLength = (prevTotalLength + sessionLength) / usage.totalSessions
      
      // 更新会话长度分布
      const lenIndex = Math.min(Math.floor(sessionLength / 10), content.sessionLengthDistribution.length - 1)
      content.sessionLengthDistribution[lenIndex]++
      
      // 更新热门话题
      this.updateTopTopics(content, topic.name)
      
      // 保存更新后的统计数据
      await db.statistics.put(stats)
    } catch (error) {
      console.error('更新特定时间范围的话题统计失败', error)
    }
  }
  
  /**
   * 更新热门话题
   * @param contentStats 内容统计
   * @param topicName 话题名称
   */
  private updateTopTopics(contentStats: ContentStats, topicName: string): void {
    try {
      // 查找是否已存在该话题
      const topicIndex = contentStats.topTopics.findIndex(topic => topic.name === topicName)
      
      if (topicIndex >= 0) {
        // 已存在，增加计数
        contentStats.topTopics[topicIndex].count++
      } else {
        // 不存在，添加新话题
        contentStats.topTopics.push({
          name: topicName,
          count: 1
        })
      }
      
      // 按计数排序
      contentStats.topTopics.sort((a, b) => b.count - a.count)
      
      // 最多保留前20个
      if (contentStats.topTopics.length > 20) {
        contentStats.topTopics = contentStats.topTopics.slice(0, 20)
      }
    } catch (error) {
      console.error('更新热门话题失败', error)
    }
  }
  
  /**
   * 计算特定时间范围内的统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据
   */
  async calculateStatsForDateRange(startDate: Date, endDate: Date): Promise<StatisticsData | null> {
    try {
      // 获取日期范围内的所有历史数据
      const dates = getDaysBetween(startDate, endDate)
      const historicalStats: StatisticsData[] = []
      
      for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0]
        const stats = await db.statistics.get(`history_daily_${dateStr}`)
        if (stats) {
          historicalStats.push(stats)
        }
      }
      
      if (historicalStats.length === 0) {
        return null
      }
      
      // 合并统计数据
      return this.mergeStatistics(historicalStats)
    } catch (error) {
      console.error('计算特定时间范围内的统计数据失败', error)
      return null
    }
  }
  
  /**
   * 合并多个统计数据
   * @param statsList 统计数据列表
   * @returns 合并后的统计数据
   */
  private mergeStatistics(statsList: StatisticsData[]): StatisticsData {
    // 创建一个新的统计数据对象
    const mergedStats = this.createEmptyStatistics('all_time')
    
    // 使用第一个和最后一个统计数据的日期作为合并后的日期范围
    const dates = statsList.map(stats => stats.date).sort()
    mergedStats.date = `${dates[0]}~${dates[dates.length - 1]}`
    
    for (const stats of statsList) {
      this.mergeUsageStats(mergedStats.data.usage!, stats.data.usage)
      this.mergeModelStats(mergedStats.data.models!, stats.data.models)
      this.mergeTimeStats(mergedStats.data.time!, stats.data.time)
      this.mergeContentStats(mergedStats.data.content!, stats.data.content)
      this.mergeResourceStats(mergedStats.data.resources!, stats.data.resources)
    }
    
    // 计算平均值
    if (statsList.length > 0) {
      mergedStats.data.usage!.avgSessionLength /= statsList.length
    }
    
    return mergedStats
  }
  
  /**
   * 合并使用情况统计
   * @param target 目标统计数据
   * @param source 源统计数据
   */
  private mergeUsageStats(target: UsageStats, source?: UsageStats): void {
    if (!source) return
    
    target.totalSessions += source.totalSessions
    target.totalMessages += source.totalMessages
    target.userMessages += source.userMessages
    target.assistantMessages += source.assistantMessages
    target.avgSessionLength += source.avgSessionLength
    target.totalUsageTime += source.totalUsageTime
    target.activeUsers = Math.max(target.activeUsers, source.activeUsers)
  }
  
  /**
   * 合并模型统计
   * @param target 目标统计数据
   * @param source 源统计数据
   */
  private mergeModelStats(target: ModelStats, source?: ModelStats): void {
    if (!source) return
    
    target.totalCalls += source.totalCalls
    
    // 合并各模型使用情况
    for (const [modelId, modelUsage] of Object.entries(source.modelUsage)) {
      if (!target.modelUsage[modelId]) {
        target.modelUsage[modelId] = { ...modelUsage }
      } else {
        const targetModelUsage = target.modelUsage[modelId]
        const totalCount = targetModelUsage.count + modelUsage.count
        
        if (totalCount > 0) {
          // 计算加权平均值
          targetModelUsage.avgResponseTime = 
            (targetModelUsage.avgResponseTime * targetModelUsage.count + 
             modelUsage.avgResponseTime * modelUsage.count) / totalCount
          
          targetModelUsage.avgResponseLength = 
            (targetModelUsage.avgResponseLength * targetModelUsage.count + 
             modelUsage.avgResponseLength * modelUsage.count) / totalCount
          
          targetModelUsage.errorRate = 
            (targetModelUsage.errorRate * targetModelUsage.count + 
             modelUsage.errorRate * modelUsage.count) / totalCount
        }
        
        targetModelUsage.count += modelUsage.count
        targetModelUsage.tokenUsage += modelUsage.tokenUsage
      }
    }
  }
  
  /**
   * 合并时间统计
   * @param target 目标统计数据
   * @param source 源统计数据
   */
  private mergeTimeStats(target: TimeStats, source?: TimeStats): void {
    if (!source) return
    
    // 合并按小时统计
    for (let i = 0; i < source.usageByHour.length && i < target.usageByHour.length; i++) {
      target.usageByHour[i].count += source.usageByHour[i].count
    }
    
    // 合并按天统计
    for (let i = 0; i < source.usageByDay.length && i < target.usageByDay.length; i++) {
      target.usageByDay[i].count += source.usageByDay[i].count
    }
    
    // 合并按月统计
    for (let i = 0; i < source.usageByMonth.length && i < target.usageByMonth.length; i++) {
      target.usageByMonth[i].count += source.usageByMonth[i].count
    }
    
    // 更新使用高峰时段
    const peakHourData = [...target.usageByHour].sort((a, b) => b.count - a.count)[0]
    if (peakHourData) {
      const peakHour = parseInt(peakHourData.timestamp)
      target.peakUsageTime = `${peakHour}:00 - ${peakHour + 1}:00`
    }
  }
  
  /**
   * 合并内容统计
   * @param target 目标统计数据
   * @param source 源统计数据
   */
  private mergeContentStats(target: ContentStats, source?: ContentStats): void {
    if (!source) return
    
    // 合并热门话题
    for (const topic of source.topTopics) {
      const targetTopic = target.topTopics.find(t => t.name === topic.name)
      if (targetTopic) {
        targetTopic.count += topic.count
      } else {
        target.topTopics.push({ ...topic })
      }
    }
    
    // 按计数排序
    target.topTopics.sort((a, b) => b.count - a.count)
    
    // 最多保留前20个
    if (target.topTopics.length > 20) {
      target.topTopics = target.topTopics.slice(0, 20)
    }
    
    // 合并关键词
    for (const keyword of source.keywords) {
      const targetKeyword = target.keywords.find(k => k.name === keyword.name)
      if (targetKeyword) {
        targetKeyword.count += keyword.count
      } else {
        target.keywords.push({ ...keyword })
      }
    }
    
    // 按计数排序
    target.keywords.sort((a, b) => b.count - a.count)
    
    // 最多保留前20个
    if (target.keywords.length > 20) {
      target.keywords = target.keywords.slice(0, 20)
    }
    
    // 合并会话长度分布
    for (let i = 0; i < source.sessionLengthDistribution.length && i < target.sessionLengthDistribution.length; i++) {
      target.sessionLengthDistribution[i] += source.sessionLengthDistribution[i]
    }
  }
  
  /**
   * 合并资源使用统计
   * @param target 目标统计数据
   * @param source 源统计数据
   */
  private mergeResourceStats(target: ResourceStats, source?: ResourceStats): void {
    if (!source) return
    
    target.totalApiCalls += source.totalApiCalls
    target.totalTokenUsage += source.totalTokenUsage
    
    // 合并按模型的Token使用量
    for (const [modelId, tokenUsage] of Object.entries(source.tokenUsageByModel)) {
      target.tokenUsageByModel[modelId] = (target.tokenUsageByModel[modelId] || 0) + tokenUsage
    }
    
    // 合并知识库使用情况
    for (const [kbId, count] of Object.entries(source.knowledgeBaseUsage)) {
      target.knowledgeBaseUsage[kbId] = (target.knowledgeBaseUsage[kbId] || 0) + count
    }
  }
  
  /**
   * 根据历史数据重新计算统计信息
   */
  async recalculateStatistics(): Promise<void> {
    try {
      // 创建新的统计数据
      const dailyStats = this.createEmptyStatistics('daily')
      const weeklyStats = this.createEmptyStatistics('weekly')
      const monthlyStats = this.createEmptyStatistics('monthly')
      const allTimeStats = this.createEmptyStatistics('all_time')
      
      // 获取所有话题
      const topics = await db.topics.toArray()
      
      // 当前时间
      const now = new Date()
      const today = getStartOfDay(now)
      const thisWeekStart = getStartOfWeek(now)
      const thisMonthStart = getStartOfMonth(now)
      
      // 处理每个话题
      for (const topic of topics) {
        // 更新话题统计
        this.updateTopicStatsForRange(allTimeStats, topic)
        
        // 检查话题的创建时间
        const topicDate = new Date(topic.createdAt || now)
        
        if (topicDate >= today) {
          this.updateTopicStatsForRange(dailyStats, topic)
        }
        
        if (topicDate >= thisWeekStart) {
          this.updateTopicStatsForRange(weeklyStats, topic)
        }
        
        if (topicDate >= thisMonthStart) {
          this.updateTopicStatsForRange(monthlyStats, topic)
        }
        
        // 处理话题中的每条消息
        for (const message of topic.messages) {
          // 更新所有时间范围的消息统计
          this.updateMessageStatsForRange(allTimeStats, message)
          
          // 检查消息的创建时间
          const messageDate = new Date(message.createdAt || now)
          
          if (messageDate >= today) {
            this.updateMessageStatsForRange(dailyStats, message)
          }
          
          if (messageDate >= thisWeekStart) {
            this.updateMessageStatsForRange(weeklyStats, message)
          }
          
          if (messageDate >= thisMonthStart) {
            this.updateMessageStatsForRange(monthlyStats, message)
          }
        }
      }
      
      // 保存统计数据
      await Promise.all([
        db.statistics.put(dailyStats),
        db.statistics.put(weeklyStats),
        db.statistics.put(monthlyStats),
        db.statistics.put(allTimeStats)
      ])
      
      console.log('统计数据重新计算完成')
    } catch (error) {
      console.error('重新计算统计数据失败', error)
    }
  }
}

// 导出统计服务单例
export const statisticsService = new StatisticsService()
