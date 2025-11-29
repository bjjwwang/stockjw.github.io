import { AnalysisFactor } from './types';

export const MARKET_CAP_OPTIONS = [
  { id: 'all', label: '全部市值' },
  { id: 'small', label: '中小盘 (<100亿)', prompt: '重点关注中小市值股票(Small Cap)，市值小于100亿人民币/20亿美元' },
  { id: 'mid', label: '中盘 (100亿-500亿)', prompt: '关注中等市值股票(Mid Cap)，市值在100亿至500亿之间' },
  { id: 'large', label: '大盘/蓝筹 (>500亿)', prompt: '只关注大盘蓝筹股(Large Cap)，市值大于500亿' },
];

export const PRESET_FACTORS: AnalysisFactor[] = [
  // --- PDF Specific Strategies (Xuesi & LXHJ) ---
  {
    id: 'xs_bottom_explosion',
    name: '薛斯通道底部爆发',
    description: '寻找日线/60分钟通道极度收窄(Flat)后，突然开口向上的形态。',
    category: '技术面'
  },
  {
    id: 'xs_strong_uptrend',
    name: '薛斯强势上涨',
    description: '通道大角度上升，K线沿着上轨(紫线)运行，回踩不破中轨。',
    category: '技术面'
  },
  {
    id: 'lxhj_resonance',
    name: 'LXHJ 60分钟共振',
    description: '日线主力控盘(黄线)走强，且60分钟级别同时出现金叉信号。',
    category: '资金面'
  },
  
  // --- Standard Factors ---
  {
    id: 'major_catalyst',
    name: '重大利好/事件驱动',
    description: '近期有重大资产重组、签订大额合同、战略合作等实质性利好公告。',
    category: '基本面'
  },
  {
    id: 'net_inflow',
    name: '主力资金抢筹',
    description: '日内或近期主力资金大额净流入 (Net Inflow Positive)。',
    category: '资金面'
  },
  {
    id: 'volume_breakout',
    name: '底部放量突破',
    description: '股价在低位盘整后，配合巨量成交突破阻力位。',
    category: '技术面'
  },
  {
    id: 'earnings_surprise',
    name: '业绩超预期',
    description: '最新财报显示盈利增长大幅超过市场预期。',
    category: '基本面'
  },
  {
    id: 'hot_concept',
    name: '风口题材',
    description: '属于当前市场最热门的概念板块 (如低空经济、AI应用)。',
    category: '基本面'
  }
];

export const PRESET_SECTORS = [
  // 科技与AI
  { id: 'ai', name: '人工智能 (AI)' },
  { id: 'gen_ai', name: '生成式AI' },
  { id: 'quantum', name: '量子计算' },
  { id: 'semicon', name: '半导体芯片' },
  { id: 'saas', name: '软件SaaS' },
  
  // 互联网与数字经济
  { id: 'internet', name: '互联网' },
  { id: 'gaming', name: '游戏传媒' },
  { id: 'data', name: '数据要素' },

  // 高端制造
  { id: 'ev', name: '新能源车' },
  { id: 'robotics', name: '人形机器人' },
  { id: 'low_alt', name: '低空经济' },
  { id: 'military', name: '国防军工' },

  // 资源与能源
  { id: 'clean_energy', name: '光伏储能' },
  { id: 'materials', name: '有色金属' },
  
  // 金融消费
  { id: 'broker', name: '券商金融' },
  { id: 'pharma', name: '医药生物' },
];

export const TIME_HORIZONS = [
  { value: '3d', label: '近3日 (超短线)' },
  { value: '5d', label: '近5日 (短线)' },
  { value: '10d', label: '近10日 (波段)' },
  { value: '1m', label: '近1个月 (趋势)' },
];