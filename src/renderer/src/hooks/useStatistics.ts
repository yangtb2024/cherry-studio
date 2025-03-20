import { statisticsService } from '@renderer/services/StatisticsService'
import { Message } from '@renderer/types'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentTopicId } from '@renderer/store/messages'
import { RootState } from '@renderer/store'

/**
 * 统计数据收集工具钩子
 * 负责监听应用程序状态变化并更新统计数据
 */
export const useStatistics = () => {
  const currentTopicId = useSelector(selectCurrentTopicId)
  const topicMessages = useSelector((state: RootState) => 
    currentTopicId ? state.messages.messagesByTopic[currentTopicId] || [] : []
  )

  /**
   * 更新消息统计
   */
  const updateMessageStats = useCallback(async (message: Message) => {
    try {
      await statisticsService.updateMessageStats(message)
    } catch (error) {
      console.error('统计消息数据失败', error)
    }
  }, [])

  /**
   * 更新话题统计
   */
  const updateTopicStats = useCallback(async (topicId: string) => {
    try {
      await statisticsService.updateTopicStats(topicId)
    } catch (error) {
      console.error('统计话题数据失败', error)
    }
  }, [])

  // 监听当前会话消息列表变化，自动更新统计数据
  useEffect(() => {
    if (!currentTopicId || topicMessages.length === 0) return

    // 对消息列表中状态为 success 的消息进行统计
    const successMessages = topicMessages.filter(msg => msg.status === 'success')
    const lastMessage = successMessages[successMessages.length - 1]

    if (lastMessage) {
      // 更新最后一条成功消息的统计
      updateMessageStats(lastMessage)
    }

    // 如果当前话题是新话题（只有一条或两条消息），则更新话题统计
    if (successMessages.length <= 2) {
      updateTopicStats(currentTopicId)
    }
  }, [currentTopicId, topicMessages, updateMessageStats, updateTopicStats])

  return {
    updateMessageStats,
    updateTopicStats
  }
}

export default useStatistics
