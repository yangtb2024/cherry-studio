import React from 'react'
import { Card, Col, Row } from 'antd'
import { useTranslation } from 'react-i18next'
import { StatisticsTimeRange, TimeStats } from '@renderer/types'
import styled from 'styled-components'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface TimeStatsCardsProps {
  data?: TimeStats
  range: StatisticsTimeRange
}

const TimeStatsCards: React.FC<TimeStatsCardsProps> = ({ data, range }) => {
  const { t } = useTranslation()

  if (!data) {
    return <EmptyCard>{t('statistics.no_data')}</EmptyCard>
  }

  // 为小时统计添加标签
  const hourlyData = data.usageByHour.map(item => ({
    ...item,
    name: `${item.timestamp}:00`,
    messages: item.count
  }))

  // 为天统计添加星期标签
  const dailyData = data.usageByDay.map(item => ({
    ...item,
    name: t(`statistics.time.weekdays.${item.timestamp}`),
    messages: item.count
  }))

  // 为月统计添加月份标签
  const monthlyData = data.usageByMonth.map(item => ({
    ...item,
    name: t(`statistics.time.months.${item.timestamp}`),
    messages: item.count
  }))

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <StyledCard title={t('statistics.trend.daily')}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={hourlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="messages" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </StyledCard>
      </Col>
      
      <Col xs={24} lg={12}>
        <StyledCard title={t('statistics.trend.weekly')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </StyledCard>
      </Col>
      
      {range === 'monthly' || range === 'all_time' ? (
        <Col xs={24}>
          <StyledCard title={t('statistics.trend.monthly')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
      ) : null}
      
      {data.peakUsageTime && (
        <Col xs={24}>
          <StyledInfoCard>
            <h3>{t('statistics.time.peak_usage_time')}</h3>
            <p>{data.peakUsageTime}</p>
          </StyledInfoCard>
        </Col>
      )}
    </Row>
  )
}

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
`

const StyledInfoCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  text-align: center;
  
  h3 {
    margin-bottom: 8px;
  }
  
  p {
    font-size: 18px;
    font-weight: bold;
    color: var(--color-primary);
  }
`

const EmptyCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
`

export default TimeStatsCards
