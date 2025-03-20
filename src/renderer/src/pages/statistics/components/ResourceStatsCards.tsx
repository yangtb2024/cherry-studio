import React from 'react'
import { Card, Col, Row, Table, Tag, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import { ResourceStats } from '@renderer/types'
import styled from 'styled-components'
import { ApiOutlined, DatabaseOutlined, KeyOutlined } from '@ant-design/icons'

interface ResourceStatsCardsProps {
  data?: ResourceStats
}

const ResourceStatsCards: React.FC<ResourceStatsCardsProps> = ({ data }) => {
  const { t } = useTranslation()

  if (!data) {
    return <EmptyCard>{t('statistics.no_data')}</EmptyCard>
  }

  // 模型Token使用数据
  const tokenByModelData = Object.entries(data.tokenUsageByModel || {})
    .map(([modelId, usage]) => ({
      modelId,
      usage
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10) // 最多显示前10个模型

  // 知识库使用数据
  const knowledgeBaseData = Object.entries(data.knowledgeBaseUsage || {})
    .map(([kbId, count]) => ({
      kbId,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // 最多显示前10个知识库

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <StyledCard>
          <Statistic
            title={t('statistics.resources.api_calls')}
            value={data.totalApiCalls}
            prefix={<ApiOutlined />}
            valueStyle={{ color: 'var(--color-primary)' }}
          />
        </StyledCard>
      </Col>
      
      <Col xs={24} md={8}>
        <StyledCard>
          <Statistic
            title={t('statistics.resources.token_usage')}
            value={data.totalTokenUsage}
            prefix={<KeyOutlined />}
            valueStyle={{ color: 'var(--color-success)' }}
          />
        </StyledCard>
      </Col>
      
      <Col xs={24} md={8}>
        <StyledCard>
          <Statistic
            title={t('statistics.resources.knowledge_base')}
            value={Object.keys(data.knowledgeBaseUsage || {}).length}
            prefix={<DatabaseOutlined />}
            valueStyle={{ color: 'var(--color-info)' }}
          />
        </StyledCard>
      </Col>
      
      <Col xs={24} lg={12}>
        <StyledCard title={`${t('statistics.resources.token_usage')}${t('common.by_model')}`}>
          <Table
            dataSource={tokenByModelData}
            rowKey="modelId"
            pagination={false}
            size="small"
            columns={[
              {
                title: `${t('common.model')} ID`,
                dataIndex: 'modelId',
                key: 'modelId',
                ellipsis: true
              },
              {
                title: t('common.usage'),
                dataIndex: 'usage',
                key: 'usage',
                render: (usage) => <Tag color="green">{usage.toLocaleString()}</Tag>,
                sorter: (a, b) => a.usage - b.usage,
                defaultSortOrder: 'descend'
              }
            ]}
            locale={{ emptyText: t('statistics.no_data') }}
          />
        </StyledCard>
      </Col>
      
      <Col xs={24} lg={12}>
        <StyledCard title={`${t('statistics.resources.knowledge_base')}${t('common.usage')}`}>
          <Table
            dataSource={knowledgeBaseData}
            rowKey="kbId"
            pagination={false}
            size="small"
            columns={[
              {
                title: `${t('common.knowledge_base')} ID`,
                dataIndex: 'kbId',
                key: 'kbId',
                ellipsis: true
              },
              {
                title: t('common.count'),
                dataIndex: 'count',
                key: 'count',
                render: (count) => <Tag color="blue">{count}</Tag>,
                sorter: (a, b) => a.count - b.count,
                defaultSortOrder: 'descend'
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

export default ResourceStatsCards
