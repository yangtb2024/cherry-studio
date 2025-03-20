import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setSidebarIcons } from '@renderer/store/settings'

/**
 * 初始化统计功能
 * 确保统计图标显示在侧边栏中
 */
export const useStatisticsInitializer = () => {
  const dispatch = useAppDispatch()
  const sidebarIcons = useAppSelector(state => state.settings.sidebarIcons)
  
  useEffect(() => {
    // 检查并添加统计图标到侧边栏
    const currentVisible = [...sidebarIcons.visible]
    if (!currentVisible.includes('statistics')) {
      console.log('Adding statistics icon to sidebar')
      currentVisible.push('statistics')
      dispatch(setSidebarIcons({ visible: currentVisible }))
    }
  }, [dispatch, sidebarIcons.visible])
}

export default useStatisticsInitializer
