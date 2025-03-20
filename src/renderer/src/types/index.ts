import OpenAI from 'openai'
import React from 'react'
import { BuiltinTheme } from 'shiki'

// 统计数据类型定义
export type StatisticsTimeRange = 'daily' | 'weekly' | 'monthly' | 'all_time'

// 基础使用统计
export interface UsageStats {
  totalSessions: number // 总会话数
  totalMessages: number // 总消息数
  userMessages: number // 用户消息数
  assistantMessages: number // 助手消息数
  avgSessionLength: number // 平均会话长度
  totalUsageTime: number // 总使用时长（分钟）
  activeUsers: number // 活跃用户数
}

// 单个模型的使用统计
export interface ModelUsageStat {
  id: string // 模型ID
  name: string // 模型名称
  count: number // 使用次数
  avgResponseTime: number // 平均响应时间（毫秒）
  avgResponseLength: number // 平均响应长度（字符数）
  errorRate: number // 错误率（0-1）
  tokenUsage: number // token使用量
}

// 模型使用统计
export interface ModelStats {
  totalCalls: number // 总调用次数
  modelUsage: Record<string, ModelUsageStat> // 各模型使用情况
}

// 时间统计项（按小时或日期）
export interface TimeDataPoint {
  timestamp: string // 时间戳
  count: number // 消息数量
}

// 时间趋势分析
export interface TimeStats {
  usageByHour: TimeDataPoint[] // 按小时的使用情况
  usageByDay: TimeDataPoint[] // 按天的使用情况
  usageByWeek: TimeDataPoint[] // 按周的使用情况
  usageByMonth: TimeDataPoint[] // 按月的使用情况
  peakUsageTime: string // 使用高峰时段
}

// 内容分析中的标签项
export interface TopicTag {
  name: string // 标签名称
  count: number // 出现次数
}

// 内容分析
export interface ContentStats {
  topTopics: TopicTag[] // 热门话题
  keywords: TopicTag[] // 关键词
  sessionLengthDistribution: number[] // 会话长度分布（各长度的会话数量）
}

// 资源使用统计
export interface ResourceStats {
  totalApiCalls: number // API总调用次数
  totalTokenUsage: number // 总Token使用量
  tokenUsageByModel: Record<string, number> // 各模型Token使用情况
  knowledgeBaseUsage: Record<string, number> // 知识库使用情况
}

// 完整的统计数据
export interface StatisticsData {
  id: string // 唯一标识符
  date: string // 日期
  type: StatisticsTimeRange // 统计类型（天/周/月/全部）
  data: {
    usage?: UsageStats // 使用情况
    models?: ModelStats // 模型统计
    time?: TimeStats // 时间趋势
    content?: ContentStats // 内容分析
    resources?: ResourceStats // 资源使用
  }
}

export type Assistant = {
  id: string
  name: string
  prompt: string
  knowledge_bases?: KnowledgeBase[]
  topics: Topic[]
  type: string
  emoji?: string
  description?: string
  model?: Model
  defaultModel?: Model
  settings?: Partial<AssistantSettings>
  messages?: AssistantMessage[]
  enableWebSearch?: boolean
}

export type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantSettingCustomParameters = {
  name: string
  value: string | number | boolean | object
  type: 'string' | 'number' | 'boolean' | 'json'
}

export type AssistantSettings = {
  contextCount: number
  temperature: number
  topP: number
  maxTokens: number | undefined
  enableMaxTokens: boolean
  streamOutput: boolean
  hideMessages: boolean
  defaultModel?: Model
  customParameters?: AssistantSettingCustomParameters[]
  reasoning_effort?: 'low' | 'medium' | 'high'
}

export type Agent = Omit<Assistant, 'model'>

export type Message = {
  id: string
  assistantId: string
  role: 'user' | 'assistant'
  content: string
  reasoning_content?: string
  translatedContent?: string
  topicId: string
  createdAt: string
  status: 'sending' | 'pending' | 'searching' | 'success' | 'paused' | 'error'
  modelId?: string
  model?: Model
  files?: FileType[]
  images?: string[]
  usage?: OpenAI.Completions.CompletionUsage
  metrics?: Metrics
  knowledgeBaseIds?: string[]
  type: 'text' | '@' | 'clear'
  isPreset?: boolean
  mentions?: Model[]
  askId?: string
  useful?: boolean
  error?: Record<string, any>
  enabledMCPs?: MCPServer[]
  metadata?: {
    // Gemini
    groundingMetadata?: any
    // Perplexity
    citations?: string[]
    // Web search
    webSearch?: WebSearchResponse
    // MCP Tools
    mcpTools?: MCPToolResponse[]
  }
}

export type Metrics = {
  completion_tokens?: number
  time_completion_millsec?: number
  time_first_token_millsec?: number
  time_thinking_millsec?: number
}

export type Topic = {
  id: string
  assistantId: string
  name: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  pinned?: boolean
  prompt?: string
  isNameManuallyEdited?: boolean
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

export type Provider = {
  id: string
  type: ProviderType
  name: string
  apiKey: string
  apiHost: string
  apiVersion?: string
  models: Model[]
  enabled?: boolean
  isSystem?: boolean
}

export type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'qwenlm' | 'azure-openai'

export type ModelType = 'text' | 'vision' | 'embedding' | 'reasoning' | 'function_calling'

export type Model = {
  id: string
  provider: string
  name: string
  group: string
  owned_by?: string
  description?: string
  type?: ModelType[]
}

export type Suggestion = {
  content: string
}

export interface Painting {
  id: string
  model?: string
  urls: string[]
  files: FileType[]
  prompt?: string
  negativePrompt?: string
  imageSize?: string
  numImages?: number
  seed?: string
  steps?: number
  guidanceScale?: number
  promptEnhancement?: boolean
}

export type MinAppType = {
  id?: string | number
  name: string
  logo?: string
  url: string
  bodered?: boolean
  background?: string
  style?: React.CSSProperties
}

export interface FileType {
  id: string
  name: string
  origin_name: string
  path: string
  size: number
  ext: string
  type: FileTypes
  created_at: string
  count: number
  tokens?: number
}

export enum FileTypes {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  auto = 'auto'
}

export type LanguageVarious = 'zh-CN' | 'zh-TW' | 'en-US' | 'ru-RU' | 'ja-JP'

export type TranslateLanguageVarious = 'chinese' | 'chinese-traditional' | 'english' | 'japanese' | 'russian'

export type CodeStyleVarious = BuiltinTheme | 'auto'

export type WebDavConfig = {
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
}

export type AppInfo = {
  version: string
  isPackaged: boolean
  appPath: string
  appDataPath: string
  resourcesPath: string
  filesPath: string
  logsPath: string
}

export interface Shortcut {
  key: string
  shortcut: string[]
  editable: boolean
  enabled: boolean
  system: boolean
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type KnowledgeItemType = 'file' | 'url' | 'note' | 'sitemap' | 'directory'

export type KnowledgeItem = {
  id: string
  baseId?: string
  uniqueId?: string
  uniqueIds?: string[]
  type: KnowledgeItemType
  content: string | FileType
  remark?: string
  created_at: number
  updated_at: number
  processingStatus?: ProcessingStatus
  processingProgress?: number
  processingError?: string
  retryCount?: number
}

export interface KnowledgeBase {
  id: string
  name: string
  model: Model
  dimensions: number
  description?: string
  items: KnowledgeItem[]
  created_at: number
  updated_at: number
  version: number
  documentCount?: number
  chunkSize?: number
  chunkOverlap?: number
  threshold?: number
  rerankModel?: Model
  topN?: number
}

export type KnowledgeBaseParams = {
  id: string
  model: string
  dimensions: number
  apiKey: string
  apiVersion?: string
  baseURL: string
  chunkSize?: number
  chunkOverlap?: number
  rerankModel?: string
  rerankModelProvider?: string
  topN?: number
}

export type GenerateImageParams = {
  model: string
  prompt: string
  negativePrompt?: string
  imageSize: string
  batchSize: number
  seed?: string
  numInferenceSteps: number
  guidanceScale: number
  signal?: AbortSignal
  promptEnhancement?: boolean
}

export interface TranslateHistory {
  id: string
  sourceText: string
  targetText: string
  sourceLanguage: string
  targetLanguage: string
  createdAt: string
}

export type SidebarIcon = 'assistants' | 'agents' | 'paintings' | 'translate' | 'minapp' | 'knowledge' | 'files' | 'statistics'

export type WebSearchProvider = {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  engines?: string[]
}

export type WebSearchResponse = {
  query?: string
  results: WebSearchResult[]
}

export type WebSearchResult = {
  title: string
  content: string
  url: string
}

export type KnowledgeReference = {
  id: number
  content: string
  sourceUrl: string
  type: KnowledgeItemType
  file?: FileType
}

export type MCPArgType = 'string' | 'list' | 'number'
export type MCPEnvType = 'string' | 'number'
export type MCPArgParameter = { [key: string]: MCPArgType }
export type MCPEnvParameter = { [key: string]: MCPEnvType }

export interface MCPServerParameter {
  name: string
  type: MCPArgType | MCPEnvType
  description: string
}

export interface MCPServer {
  name: string
  description?: string
  baseUrl?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  isActive: boolean
}

export interface MCPToolInputSchema {
  type: string
  title: string
  description?: string
  required?: string[]
  properties: Record<string, object>
}

export interface MCPTool {
  id: string
  serverName: string
  name: string
  description?: string
  inputSchema: MCPToolInputSchema
}

export interface MCPConfig {
  servers: MCPServer[]
}

export interface MCPToolResponse {
  id: string // tool call id, it should be unique
  tool: MCPTool // tool info
  status: string // 'invoking' | 'done'
  response?: any
}
