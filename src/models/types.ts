/**
 * 模型响应接口
 */
export interface ModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * 模型配置接口
 */
export interface ModelConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  providerId?: string; // 模型提供者ID
  autoAnalyze?: boolean;
  showExamples?: boolean;
  typingIndicator?: boolean;
  autoApproveCreate?: boolean;
  autoApproveEdit?: boolean;
  autoApproveDelete?: boolean;
  autoApproveDelay?: number;
}