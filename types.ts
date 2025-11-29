export enum MarketType {
  CN = 'A股市场 (China A-Shares)',
  US = '美股市场 (US Market)',
  HK = '港股市场 (HK Stocks)'
}

export interface AnalysisFactor {
  id: string;
  name: string;
  description: string;
  category: '技术面' | '基本面' | '资金面';
}

export interface TechnicalAnalysis {
  xsStatus: '底部' | '爆发' | '上升' | '顶部' | '调整'; // 薛斯通道状态
  xsDescription: string;
  lxhjStatus: '主力介入' | '金叉' | '背离' | '流出'; // LXHJ 状态
  resonance60m: boolean; // 是否60分钟共振
  channelWidth: number; // 0-100, 0 is very narrow (good for explosion), 100 is wide
}

export interface StockData {
  ticker: string;
  name: string;
  price: string;
  changePercent: number;
  market: string;
  marketCap: string; // e.g. "45亿"
  netInflowAmount?: string; 
  reasoning: string;
  latestPositiveNews?: string; // New field for good news
  volumeAnalysis?: string;
  flowAnalysis?: string;
  trendPoints: number[]; 
  technical: TechnicalAnalysis; // New structured technical data
  sources?: { title: string; uri: string }[];
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: StockData[] | null;
}