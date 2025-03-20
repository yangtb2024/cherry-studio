import React from 'react'
import { Card, Col, Row, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import { UsageStats } from '@renderer/types'
import styled from 'styled-components'
import { MessageOutlined, UserOutlined } from '@ant-design/icons'

interface UsageStatsCardProps {
  data?: UsageStats
}

const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ data }) => {
  const { t } = useTranslation()

  if (!data) {
    return <EmptyCard>{t('statistics.no_data')}</EmptyCard>
  }

  return (
    <StyledCard>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.total_sessions')}
            value={data.totalSessions}
            valueStyle={{ color: 'var(--color-primary)' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.total_messages')}
            value={data.totalMessages}
            valueStyle={{ color: 'var(--color-success)' }}
            prefix={<MessageOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.user_messages')}
            value={data.userMessages}
            valueStyle={{ color: 'var(--color-info)' }}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.assistant_messages')}
            value={data.assistantMessages}
            valueStyle={{ color: 'var(--color-warning)' }}
            prefix={<span>AI</span>}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.avg_session_length')}
            value={data.avgSessionLength.toFixed(1)}
            precision={1}
            valueStyle={{ color: 'var(--color-secondary)' }}
            suffix={t('common.messages')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title={t('statistics.total_usage_time')}
            value={Math.round(data.totalUsageTime)}
            valueStyle={{ color: 'var(--color-error)' }}
            suffix={t('common.minute', { count: Math.round(data.totalUsageTime) })}
          />
        </Col>
      </Row>
    </StyledCard>
  )
}

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
`

const EmptyCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
`

export default UsageStatsCard
