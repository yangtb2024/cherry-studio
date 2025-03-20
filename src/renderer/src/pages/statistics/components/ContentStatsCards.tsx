import React from 'react'
import { Card, Col, Row, Table, Tag, Progress, List } from 'antd'
import { useTranslation } from 'react-i18next'
import { ContentStats } from '@renderer/types'
import styled from 'styled-components'

interface ContentStatsCardsProps {
  data?: ContentStats
}

const ContentStatsCards: React.FC<ContentStatsCardsProps> = ({ data }) => {
  const { t } = useTranslation()

  if (!data) {
    return <EmptyCard>{t('statistics.no_data')}</EmptyCard>
  }

  // 会话长度分布
  const sessionLengthData = data.sessionLengthDistribution.map((count, index) => ({
    range: `${index * 10 + 1}-${(index + 1) * 10}`,
    count
  }))

  // 热门话题
  const topTopicsData = [...(data.topTopics || [])].slice(0, 10)
  
  // 计算热门话题最大计数（用于百分比计算）
  const maxTopicCount = topTopicsData.length > 0 
    ? Math.max(...topTopicsData.map(topic => topic.count)) 
    : 1

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <StyledCard title={t('statistics.content.topics')}>
          <List
            dataSource={topTopicsData}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.name}
                  description={
                    <Progress 
                      percent={Math.round((item.count / maxTopicCount) * 100)} 
                      format={() => item.count} 
                      size="small"
                    />
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: t('statistics.no_data') }}
          />
        </StyledCard>
      </Col>
      
      <Col xs={24} lg={12}>
        <StyledCard title={t('statistics.content.session_length')}>
          <Table
            dataSource={sessionLengthData}
            pagination={false}
            size="small"
            columns={[
              {
                title: t('common.messages'),
                dataIndex: 'range',
                key: 'range',
              },
              {
                title: t('common.count'),
                dataIndex: 'count',
                key: 'count',
                render: (count: number) => <Tag color="blue">{count}</Tag>
              }
            ]}
            locale={{ emptyText: t('statistics.no_data') }}
          />
        </StyledCard>
      </Col>
    </Row>
  )
}

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  height: 100%;
`

const EmptyCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
`

export default ContentStatsCards
