export interface StrategyConfig {
  market_scope: 'US' | 'CN'; // US Market or A-Shares
  market_cap_tier: 'all' | 'small' | 'mid' | 'large'; // Market Cap Filter
  trend_period: '5d' | '10d' | '20d' | '60d'; // Trend Calculation Period
  slope_range: [number, number]; // New: Min and Max slope (0.0 to 1.0)
  selected_factors: string[]; // Array of selected strategy tags
  selected_sectors: string[]; // Array of selected industry sectors
}

export interface StockCardData {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  market_cap: string;
  volume?: string; // New: Trading Volume (e.g. "50万手" or "12M")
  quote_time?: string; // New: Real-time quote timestamp (e.g., "14:30:00")
  slope: number; // New: Quantitative Trend Velocity (0.0 - 1.0)
  tags: {
    label: string;
    type: 'bullish' | 'bearish' | 'neutral' | 'event';
  }[];
  analysis: {
    event_title?: string;
    event_content?: string;
    ai_logic?: string; // "AI 选股逻辑 & 题材"
    tech_diagnosis?: string; // "薛斯通道 & LXHJ 战法诊断"
    fund_analysis?: string; // "资金面分析"
  };
  charts?: {
    trend: 'up' | 'down' | 'flat'; // Simplified for UI
  };
  sources?: {
      title: string;
      uri: string;
  }[];
}

export interface AnalysisResult {
  symbol: string;
  status: string;
  timestamp: string;
  features: {
    slope: number;
    is_platform: boolean;
    current_price: number;
    ema10: number;
  };
  ai_analysis?: string;
}