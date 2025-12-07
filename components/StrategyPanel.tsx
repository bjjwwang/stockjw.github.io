import React, { useState, useRef, useEffect } from 'react';
import { Layers, Zap, TrendingUp, BarChart3, Globe, Search, Grid, Filter, ChevronDown, Clock, Activity, Check, Flame, DollarSign } from 'lucide-react';
import { StrategyConfig } from '../types';

interface StrategyPanelProps {
  config: StrategyConfig;
  setConfig: React.Dispatch<React.SetStateAction<StrategyConfig>>;
  onScan: () => void;
  isLoading: boolean;
}

const SECTORS = [
    { id: 'all', label: '全市场 / 不限' },
    { id: 'ai', label: '人工智能 (AI & Robotics)' },
    { id: 'semi', label: '半导体 / 芯片' },
    { id: 'ev', label: '新能源 / 锂电' },
    { id: 'bio', label: '生物医药' },
    { id: 'saas', label: '软件 / SaaS / 云计算' },
    { id: 'crypto', label: '数字货币 / 区块链' },
    { id: 'fin', label: '金融 / 券商' },
    { id: 'consumer', label: '大消费 / 零售' },
    { id: 'manuf', label: '高端制造 / 工业互联' },
    { id: 'military', label: '国防军工 / 航天' },
    { id: 'energy', label: '传统能源 / 石油煤炭' },
    { id: 'materials', label: '有色金属 / 稀土' },
    { id: 'infra', label: '基建 / 工程机械' },
    { id: 'media', label: '传媒 / 游戏 / 元宇宙' },
    { id: 'logistics', label: '交通物流 / 航运' },
    { id: 'telecom', label: '5G / 通信设备' },
];

// Technical Indicators -> Goes into the Dropdown (Pure Techncials)
const TECHNICAL_INDICATORS = [
    { id: 'channel_breakout', label: '薛斯通道底部爆发' },
    { id: 'strong_trend', label: '薛斯通道强势上涨' },
    { id: 'macd_cross', label: 'MACD 金叉买入' },
    { id: 'kdj_oversold', label: 'KDJ 超卖反弹' },
];

// Money Flow & Volume -> Visible Buttons (Now includes Resonance)
const FLOW_FACTORS = [
    { id: 'fund_inflow', label: '主力资金抢筹 / 北向流入', icon: DollarSign, color: 'text-yellow-400', border: 'border-yellow-500/50' },
    { id: 'bottom_volume', label: '底部放量 / 量价齐升', icon: BarChart3, color: 'text-cyan-400', border: 'border-cyan-500/50' },
    { id: 'fund_resonance', label: 'LXHJ 60分钟共振 / 资金合力', icon: Activity, color: 'text-fuchsia-400', border: 'border-fuchsia-500/50' },
];

// Fundamental/News Factors -> Visible Buttons
const FUNDAMENTAL_FACTORS = [
    { id: 'event_driven', label: '重大利好 / 事件驱动', icon: Zap, color: 'text-orange-400', border: 'border-orange-500/50' },
    { id: 'earnings_beat', label: '业绩超预期 / 财报', icon: Flame, color: 'text-red-400', border: 'border-red-500/50' },
];

const StrategyPanel: React.FC<StrategyPanelProps> = ({ config, setConfig, onScan, isLoading }) => {
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTechDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFactor = (factor: string) => {
    const current = config.selected_factors;
    if (current.includes(factor)) {
      setConfig({ ...config, selected_factors: current.filter(f => f !== factor) });
    } else {
      setConfig({ ...config, selected_factors: [...current, factor] });
    }
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'all') {
          setConfig({ ...config, selected_sectors: [] });
      } else {
          setConfig({ ...config, selected_sectors: [val] });
      }
  };

  // Helper for Slope Label
  const getSlopeLabel = (min: number) => {
      if (min < 0.10) return { text: "💤 盘整震荡", color: "text-slate-400" };
      if (min < 0.35) return { text: "⚓ 底部蓄势", color: "text-cyan-400" };
      if (min < 0.75) return { text: "📈 稳健趋势", color: "text-blue-400" };
      return { text: "🚀 极强爆发", color: "text-green-400" };
  };

  const slopeInfo = getSlopeLabel(config.slope_range[0]);

  return (
    <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <style>
        {`
          .range-slider-thumb-pointer-events-auto {
            pointer-events: none;
          }
          .range-slider-thumb-pointer-events-auto::-webkit-slider-thumb {
            pointer-events: auto;
            width: 20px;
            height: 20px;
            -webkit-appearance: none;
            cursor: pointer;
            border-radius: 50%;
            /* Make it roughly match the visual thumb size for hit testing */
          }
          .range-slider-thumb-pointer-events-auto::-moz-range-thumb {
            pointer-events: auto;
            width: 20px;
            height: 20px;
            cursor: pointer;
            border: none;
            border-radius: 50%;
          }
        `}
      </style>
      
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Layers size={24} />
          <h1 className="text-xl font-bold tracking-wide">QuantFlow</h1>
        </div>
        <p className="text-xs text-slate-500">AI 驱动的量化投研平台</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        {/* Market Scope */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">市场范围</h3>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setConfig({...config, market_scope: 'CN'})}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${config.market_scope === 'CN' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
            >
              A股市场
            </button>
            <button 
              onClick={() => setConfig({...config, market_scope: 'US'})}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${config.market_scope === 'US' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
            >
              美股市场
            </button>
          </div>
        </div>

        {/* Screening Filters (Market Cap & Period) */}
        <div>
            <div className="flex items-center gap-1.5 mb-3 px-1 text-slate-500">
               <Filter size={12} />
               <h3 className="text-xs font-bold uppercase tracking-wider">市值筛选 & 周期</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
               {/* Market Cap Dropdown */}
               <div className="relative">
                   <select 
                       value={config.market_cap_tier}
                       onChange={(e) => setConfig({...config, market_cap_tier: e.target.value as any})}
                       className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-medium cursor-pointer hover:border-slate-600 transition-colors"
                   >
                       <option value="all">全部市值</option>
                       <option value="small">中小盘 (&lt;100亿)</option>
                       <option value="mid">中盘股 (100-500亿)</option>
                       <option value="large">大盘股 (&gt;500亿)</option>
                   </select>
                   <ChevronDown className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" size={14} />
               </div>

               {/* Trend Period Dropdown */}
               <div className="relative">
                   <select 
                       value={config.trend_period}
                       onChange={(e) => setConfig({...config, trend_period: e.target.value as any})}
                       className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-medium cursor-pointer hover:border-slate-600 transition-colors"
                   >
                       <option value="5d">近5日 (短线)</option>
                       <option value="10d">近10日 (中短)</option>
                       <option value="20d">近20日 (月线)</option>
                       <option value="60d">近60日 (季线)</option>
                   </select>
                   <Clock className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" size={14} />
               </div>
           </div>
        </div>

        {/* Sectors / Industries Dropdown */}
        <div>
           <div className="flex items-center gap-1.5 mb-3 px-1 text-slate-500">
               <Grid size={12} />
               <h3 className="text-xs font-bold uppercase tracking-wider">目标板块 / 题材</h3>
           </div>
           
           <div className="relative">
               <select 
                   value={config.selected_sectors.length > 0 ? config.selected_sectors[0] : 'all'}
                   onChange={handleSectorChange}
                   className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-medium cursor-pointer hover:border-slate-600 transition-colors"
               >
                   {SECTORS.map((sector) => (
                       <option key={sector.id} value={sector.id}>
                           {sector.label}
                       </option>
                   ))}
               </select>
               <ChevronDown className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" size={14} />
           </div>
        </div>

        {/* TREND VELOCITY SLIDER */}
        <div>
             <div className="flex items-center justify-between mb-3 px-1 text-slate-500">
               <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    <h3 className="text-xs font-bold uppercase tracking-wider">趋势评分 (Slope)</h3>
               </div>
               <span className={`text-[10px] font-bold ${slopeInfo.color}`}>{slopeInfo.text}</span>
           </div>
           
           <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800 relative pt-6 pb-2">
                {/* Visual Track Background with Zoned Colors */}
                <div className="absolute top-8 left-4 right-4 h-1 rounded-full overflow-hidden flex">
                     {/* 0-0.10: Flat (Gray) */}
                     <div className="h-full bg-slate-600" style={{width: '10%'}} title="盘整区"></div>
                     {/* 0.10-0.35: Building (Cyan) */}
                     <div className="h-full bg-cyan-900/60" style={{width: '25%'}} title="蓄势区"></div>
                     {/* 0.35-0.75: Strong (Blue) */}
                     <div className="h-full bg-blue-800/60" style={{width: '40%'}} title="稳健区"></div>
                     {/* 0.75-1.00: Skyrocket (Green) */}
                     <div className="h-full bg-emerald-600/60" style={{width: '25%'}} title="爆发区"></div>
                </div>
                
                {/* Active Range Track (Highlighter) */}
                <div 
                    className="absolute top-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] pointer-events-none z-0"
                    style={{
                        left: `${config.slope_range[0] * 100}%`,
                        right: `${100 - (config.slope_range[1] * 100)}%`
                    }}
                ></div>

                {/* Range Inputs (Overlaid) */}
                <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={config.slope_range[0]}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < config.slope_range[1]) {
                            setConfig({...config, slope_range: [val, config.slope_range[1]]});
                        }
                    }}
                    className="absolute w-full top-6 left-0 h-4 opacity-0 z-20 range-slider-thumb-pointer-events-auto"
                />
                <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={config.slope_range[1]}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > config.slope_range[0]) {
                            setConfig({...config, slope_range: [config.slope_range[0], val]});
                        }
                    }}
                    className="absolute w-full top-6 left-0 h-4 opacity-0 z-20 range-slider-thumb-pointer-events-auto"
                />

                {/* Visual Thumbs (Fake) */}
                <div 
                    className="absolute top-6 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg pointer-events-none z-10 transition-transform"
                    style={{ left: `calc(${config.slope_range[0] * 100}% - 8px)` }}
                ></div>
                 <div 
                    className="absolute top-6 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg pointer-events-none z-10 transition-transform"
                    style={{ left: `calc(${config.slope_range[1] * 100}% - 8px)` }}
                ></div>

                {/* Labels */}
                <div className="flex justify-between mt-4 text-[10px] font-mono text-slate-400">
                    <span>{config.slope_range[0].toFixed(2)}</span>
                    <span>{config.slope_range[1].toFixed(2)}</span>
                </div>
           </div>
        </div>

        {/* Technical Indicators - DROPDOWN (Now only pure Technicals) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">技术指标 / 战法</h3>
          
          <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2.5 px-3 flex items-center justify-between text-xs hover:border-slate-600 transition-colors"
              >
                  <span className="truncate">
                      {config.selected_factors.filter(f => TECHNICAL_INDICATORS.some(t => t.id === f)).length === 0 
                        ? "选择技术指标..." 
                        : `已选 ${config.selected_factors.filter(f => TECHNICAL_INDICATORS.some(t => t.id === f)).length} 个指标`}
                  </span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${techDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {techDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-850 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {TECHNICAL_INDICATORS.map((factor) => {
                          const isSelected = config.selected_factors.includes(factor.id);
                          return (
                              <div 
                                key={factor.id}
                                onClick={() => toggleFactor(factor.id)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-slate-700/50 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'}`}
                              >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                      {isSelected && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className="text-xs">{factor.label}</span>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
          
          {/* Selected Technical Tags Display */}
          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
              {config.selected_factors
                .filter(fid => TECHNICAL_INDICATORS.some(t => t.id === fid))
                .map(fid => {
                  const label = TECHNICAL_INDICATORS.find(f => f.id === fid)?.label;
                  return (
                      <span key={fid} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          {label}
                          <button onClick={(e) => { e.stopPropagation(); toggleFactor(fid); }} className="hover:text-white"><Activity size={8} /></button>
                      </span>
                  )
              })}
          </div>
        </div>

        {/* Money Flow / Volume - VISIBLE SECTION (Updated) */}
        <div>
          <div className="flex items-center gap-1.5 mb-3 px-1 text-slate-500">
               <DollarSign size={12} />
               <h3 className="text-xs font-bold uppercase tracking-wider">资金 & 量能</h3>
           </div>
          
          <div className="space-y-2 mb-6">
              {FLOW_FACTORS.map((factor) => {
                  const isSelected = config.selected_factors.includes(factor.id);
                  const Icon = factor.icon;
                  return (
                    <button
                        key={factor.id}
                        onClick={() => toggleFactor(factor.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm ${
                        isSelected 
                            ? `bg-slate-800 ${factor.color} ${factor.border} shadow-lg` 
                            : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {Icon && <Icon size={16} />}
                            <span>{factor.label}</span>
                        </div>
                        {isSelected && <div className={`w-2 h-2 rounded-full bg-current`} />}
                    </button>
                  );
              })}
          </div>
        </div>

        {/* Fundamental / News Factors - VISIBLE BUTTONS */}
        <div>
          <div className="flex items-center gap-1.5 mb-3 px-1 text-slate-500">
               <Globe size={12} />
               <h3 className="text-xs font-bold uppercase tracking-wider">消息 / 基本面</h3>
           </div>
          
          <div className="space-y-2">
              {FUNDAMENTAL_FACTORS.map((factor) => {
                  const isSelected = config.selected_factors.includes(factor.id);
                  const Icon = factor.icon;
                  return (
                    <button
                        key={factor.id}
                        onClick={() => toggleFactor(factor.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm ${
                        isSelected 
                            ? `bg-slate-800 ${factor.color} ${factor.border} shadow-lg` 
                            : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {Icon && <Icon size={16} />}
                            <span>{factor.label}</span>
                        </div>
                        {isSelected && <div className={`w-2 h-2 rounded-full bg-current`} />}
                    </button>
                  );
              })}
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button
          onClick={onScan}
          disabled={isLoading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="animate-pulse">扫描中...</span>
          ) : (
            <>
              <Search size={18} />
              <span>开始筛选</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StrategyPanel;