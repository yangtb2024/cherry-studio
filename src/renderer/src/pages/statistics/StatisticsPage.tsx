import { BarChartOutlined, LineChartOutlined, PieChartOutlined, ApiOutlined, FileOutlined, SyncOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  fetchStatistics,
  recalculateStatistics,
  selectStatisticsData,
  selectStatisticsState,
  setCurrentRange
} from '@renderer/store/statistics'
import { StatisticsTimeRange } from '@renderer/types'
import { Alert, Button, Card, Radio, Spin, Tooltip } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import UsageStatsCard from './components/UsageStatsCard'
import ModelStatsCards from './components/ModelStatsCards'
import TimeStatsCards from './components/TimeStatsCards'
import ContentStatsCards from './components/ContentStatsCards'
import ResourceStatsCards from './components/ResourceStatsCards'

export const StatisticsPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const statisticsState = useAppSelector(selectStatisticsState)
  const currentData = useAppSelector(selectStatisticsData)

  const [isRecalculating, setIsRecalculating] = useState(false)

  // 当组件挂载时加载统计数据
  useEffect(() => {
    const loadData = async () => {
      // 加载当前选择的时间范围数据
      await dispatch(fetchStatistics(statisticsState.currentRange))
    }
    
    loadData()
  }, [dispatch, statisticsState.currentRange])

  const handleRangeChange = (range: StatisticsTimeRange) => {
    dispatch(setCurrentRange(range))
  }

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    try {
      await dispatch(recalculateStatistics()).unwrap()
    } catch (error) {
      console.error('Failed to recalculate statistics:', error)
    } finally {
      setIsRecalculating(false)
    }
  }

  const getFormattedLastUpdated = () => {
    if (!statisticsState.lastUpdated) return ''
    return dayjs(statisticsState.lastUpdated).format('YYYY-MM-DD HH:mm:ss')
  }

  // 获取当前路由路径
  const [activeCategory, setActiveCategory] = useState<string>('overview')

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('statistics.title')}</NavbarCenter>
      </Navbar>

      <ContentContainer id="content-container">
        <SettingMenus>
          <MenuItemLink className={activeCategory === 'overview' ? 'active' : ''} onClick={() => setActiveCategory('overview')}>
            <MenuItem className={activeCategory === 'overview' ? 'active' : ''}>
              <BarChartOutlined />
              {t('statistics.overview')}
            </MenuItem>
          </MenuItemLink>
          <MenuItemLink className={activeCategory === 'models' ? 'active' : ''} onClick={() => setActiveCategory('models')}>
            <MenuItem className={activeCategory === 'models' ? 'active' : ''}>
              <PieChartOutlined />
              {t('statistics.models')}
            </MenuItem>
          </MenuItemLink>
          <MenuItemLink className={activeCategory === 'time' ? 'active' : ''} onClick={() => setActiveCategory('time')}>
            <MenuItem className={activeCategory === 'time' ? 'active' : ''}>
              <LineChartOutlined />
              {t('statistics.time_title')}
            </MenuItem>
          </MenuItemLink>
          <MenuItemLink className={activeCategory === 'content' ? 'active' : ''} onClick={() => setActiveCategory('content')}>
            <MenuItem className={activeCategory === 'content' ? 'active' : ''}>
              <FileOutlined />
              {t('statistics.content_title')}
            </MenuItem>
          </MenuItemLink>
          <MenuItemLink className={activeCategory === 'resources' ? 'active' : ''} onClick={() => setActiveCategory('resources')}>
            <MenuItem className={activeCategory === 'resources' ? 'active' : ''}>
              <ApiOutlined />
              {t('statistics.resources_title')}
            </MenuItem>
          </MenuItemLink>
        </SettingMenus>

        <SettingContent>
          {statisticsState.error && (
            <Alert
              message={
                statisticsState.error
                  ? (() => {
                      if (statisticsState.error === 'statistics.fetch_error') {
                        return t('statistics.fetch_error');
                      } else if (statisticsState.error === 'statistics.fetch_custom_range_error') {
                        return t('statistics.fetch_custom_range_error');
                      } else if (statisticsState.error === 'statistics.recalculate_error') {
                        return t('statistics.recalculate_error');
                      }
                      return t('error.chat.response'); // 通用错误信息
                    })()
                  : t('statistics.no_data')
              }
              type="error"
              style={{ marginBottom: 16 }}
              closable
            />
          )}

          <StatsHeader>
            <RangeContainer>
              <Radio.Group 
                value={statisticsState.currentRange}
                onChange={(e) => handleRangeChange(e.target.value as StatisticsTimeRange)}
                buttonStyle="solid"
              >
                <Radio.Button value="daily">{t('statistics.time_range.today')}</Radio.Button>
                <Radio.Button value="weekly">{t('statistics.time_range.week')}</Radio.Button>
                <Radio.Button value="monthly">{t('statistics.time_range.month')}</Radio.Button>
                <Radio.Button value="all_time">{t('statistics.time_range.all')}</Radio.Button>
              </Radio.Group>
              
              <Tooltip title={t('statistics.recalculate_tooltip')}>
                <RecalculateButton
                  type="primary"
                  icon={<SyncOutlined spin={isRecalculating} />}
                  onClick={handleRecalculate}
                  loading={isRecalculating}
                >
                  {isRecalculating 
                    ? t('statistics.recalculating') 
                    : t('statistics.recalculate')
                  }
                </RecalculateButton>
              </Tooltip>
            </RangeContainer>
            
            <LastUpdated>
              {statisticsState.lastUpdated && (
                t('statistics.last_updated', { time: getFormattedLastUpdated() })
              )}
            </LastUpdated>
          </StatsHeader>

          {statisticsState.loading ? (
            <LoadingContainer>
              <Spin size="large" tip={t('statistics.loading')} />
            </LoadingContainer>
          ) : !currentData ? (
            <NoDataContainer>
              <Card>
                <EmptyMessage>{t('statistics.no_data')}</EmptyMessage>
              </Card>
            </NoDataContainer>
          ) : (
            <>
              {activeCategory === 'overview' && <UsageStatsCard data={currentData.data.usage} />}
              {activeCategory === 'models' && <ModelStatsCards data={currentData.data.models} />}
              {activeCategory === 'time' && <TimeStatsCards data={currentData.data.time} range={statisticsState.currentRange} />}
              {activeCategory === 'content' && <ContentStatsCards data={currentData.data.content} />}
              {activeCategory === 'resources' && <ResourceStatsCards data={currentData.data.resources} />}
            </>
          )}
        </SettingContent>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`

const SettingMenus = styled.ul`
  display: flex;
  flex-direction: column;
  min-width: var(--settings-width);
  border-right: 0.5px solid var(--color-border);
  padding: 10px;
  user-select: none;
`

const MenuItemLink = styled.div`
  text-decoration: none;
  color: var(--color-text-1);
  margin-bottom: 5px;
  cursor: pointer;

  &.active {
    color: var(--color-primary);
  }
`

const MenuItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  width: 100%;
  cursor: pointer;
  border-radius: var(--list-item-border-radius);
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: 0.5px solid transparent;

  .anticon {
    font-size: 16px;
    opacity: 0.8;
  }

  .iconfont {
    font-size: 18px;
    line-height: 18px;
    opacity: 0.7;
    margin-left: -1px;
  }

  &:hover {
    background: var(--color-background-soft);
  }

  &.active {
    background: var(--color-background-soft);
    border: 0.5px solid var(--color-border);
  }
`

const SettingContent = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  padding: 15px;
  flex-direction: column;
`

const StatsHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const RecalculateButton = styled(Button)`
  display: flex;
  align-items: center;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`

const NoDataContainer = styled.div`
  padding: 40px 0;
  text-align: center;
`

const EmptyMessage = styled.div`
  font-size: 16px;
  color: var(--color-text-secondary);
`

const LastUpdated = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
`

export default StatisticsPage
