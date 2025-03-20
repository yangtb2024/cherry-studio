import React from 'react'
import { Card, Progress, Table, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { ModelStats, ModelUsageStat } from '@renderer/types'
import styled from 'styled-components'
import { ColumnProps } from 'antd/es/table'

interface ModelStatsCardsProps {
  data?: ModelStats
}

const ModelStatsCards: React.FC<ModelStatsCardsProps> = ({ data }) => {
  const { t } = useTranslation()

  if (!data) {
    return <EmptyCard>{t('statistics.no_data')}</EmptyCard>
  }

  // 转换数据为表格数组
  const modelUsageData = Object.values(data.modelUsage || {}).sort((a, b) => b.count - a.count)

  const columns: ColumnProps<ModelUsageStat>[] = [
    {
      title: t('common.model'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="blue">{name}</Tag>
    },
    {
      title: t('statistics.model_usage'),
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
      render: (count: number) => (
        <Progress 
          percent={Math.round((count / (data.totalCalls || 1)) * 100)} 
          format={() => count}
          size="small"
        />
      )
    },
    {
      title: t('statistics.model_response_time'),
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      sorter: (a, b) => a.avgResponseTime - b.avgResponseTime,
      render: (time: number) => `${time.toFixed(0)} ms`
    },
    {
      title: t('statistics.model_response_length'),
      dataIndex: 'avgResponseLength',
      key: 'avgResponseLength',
      sorter: (a, b) => a.avgResponseLength - b.avgResponseLength,
      render: (length: number) => length.toFixed(0)
    },
    {
      title: t('statistics.model_error_rate'),
      dataIndex: 'errorRate',
      key: 'errorRate',
      sorter: (a, b) => a.errorRate - b.errorRate,
      render: (rate: number) => {
        const percent = (rate * 100).toFixed(1)
        const color = rate > 0.1 ? 'red' : rate > 0.05 ? 'orange' : 'green'
        return <Tag color={color}>{percent}%</Tag>
      }
    }
  ]

  return (
    <StyledCard>
      <Table<ModelUsageStat>
        dataSource={modelUsageData}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </StyledCard>
  )
}

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;

  .ant-table-wrapper {
    overflow-x: auto;
  }
`

const EmptyCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
`

export default ModelStatsCards
