import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { StatisticsData, StatisticsTimeRange } from '@renderer/types'
import { statisticsService } from '@renderer/services/StatisticsService'

// 统计状态类型
export interface StatisticsState {
  currentRange: StatisticsTimeRange
  loading: boolean
  data: {
    daily?: StatisticsData
    weekly?: StatisticsData
    monthly?: StatisticsData
    all_time?: StatisticsData
    custom?: StatisticsData
  }
  error: string | null
  lastUpdated: string | null
}

// 初始状态
const initialState: StatisticsState = {
  currentRange: 'daily',
  loading: false,
  data: {},
  error: null,
  lastUpdated: null
}

// 异步获取统计数据
export const fetchStatistics = createAsyncThunk(
  'statistics/fetch',
  async (range: StatisticsTimeRange, { rejectWithValue }) => {
    try {
      const stats = await statisticsService.getStatistics(range)
      return { range, stats }
    } catch (error) {
      // 将错误信息设置为 i18n 的 key
      return rejectWithValue('statistics.fetch_error')
    }
  }
)

// 异步获取自定义日期范围的统计数据
export const fetchCustomRangeStatistics = createAsyncThunk(
  'statistics/fetchCustomRange',
  async ({ startDate, endDate }: { startDate: Date; endDate: Date }, { rejectWithValue }) => {
    try {
      const stats = await statisticsService.calculateStatsForDateRange(startDate, endDate)
      return stats
    } catch (error) {
      return rejectWithValue('statistics.fetch_custom_range_error')
    }
  }
)

// 重新计算所有统计数据
export const recalculateStatistics = createAsyncThunk(
  'statistics/recalculate',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await statisticsService.recalculateStatistics()
      
      // 重新获取所有统计数据
      await Promise.all([
        dispatch(fetchStatistics('daily')),
        dispatch(fetchStatistics('weekly')),
        dispatch(fetchStatistics('monthly')),
        dispatch(fetchStatistics('all_time'))
      ])
      
      return true
    } catch (error) {
      return rejectWithValue('statistics.recalculate_error')
    }
  }
)

// 创建统计Redux切片
const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setCurrentRange: (state, action) => {
      state.currentRange = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取统计数据
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        const { range, stats } = action.payload
        if (stats) {
          state.data[range] = stats
        }
        state.loading = false
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // 获取自定义日期范围的统计数据
      .addCase(fetchCustomRangeStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomRangeStatistics.fulfilled, (state, action) => {
        if (action.payload) {
          state.data.custom = action.payload
        }
        state.loading = false
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchCustomRangeStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // 重新计算统计数据
      .addCase(recalculateStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(recalculateStatistics.fulfilled, (state) => {
        state.loading = false
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(recalculateStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

// 导出 action creators
export const { setCurrentRange, clearError } = statisticsSlice.actions

// 导出 selectors
export const selectStatisticsData = (state: { statistics: StatisticsState }) => {
  const { currentRange, data } = state.statistics
  return data[currentRange]
}

export const selectStatisticsState = (state: { statistics: StatisticsState }) => state.statistics

// 导出 reducer
export default statisticsSlice.reducer
