import React, { ReactNode } from 'react'
import useStatistics from '@renderer/hooks/useStatistics'
import useStatisticsInitializer from '@renderer/hooks/useStatisticsInitializer'

interface StatisticsProviderProps {
  children: ReactNode
}

/**
 * 统计功能提供器组件
 * 在应用程序中挂载统计钩子，以便跟踪各项数据
 */
const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ children }) => {
  // 初始化统计钩子，将在这个位置开始监听应用程序状态变化
  useStatistics()
  
  // 确保统计图标在侧边栏中显示
  useStatisticsInitializer()

  // 直接渲染子组件，不添加额外的DOM元素
  return <>{children}</>
}

export default StatisticsProvider
