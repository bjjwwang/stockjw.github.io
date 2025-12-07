import React from 'react';
import { Sparkles, Activity, Zap, DollarSign, ExternalLink, TrendingUp, Rocket, Anchor, MoreHorizontal, Clock, BarChart2 } from 'lucide-react';
import { StockCardData } from '../types';

interface StockCardProps {
  data: StockCardData;
}

const StockCard: React.FC<StockCardProps> = ({ data }) => {
  
  // Helper to determine slope badge style and icon
  const getSlopeBadge = (slope: number) => {
      if (slope >= 0.75) {
          return {
              style: 'bg-green-900/40 text-green-400 border-green-500',
              icon: Rocket,
              text: '极强爆发'
          };
      } else if (slope >= 0.35) {
          return {
              style: 'bg-blue-900/40 text-blue-400 border-blue-500',
              icon: TrendingUp,
              text: '稳健趋势'
          };
      } else if (slope >= 0.10) {
          return {
              style: 'bg-cyan-900/40 text-cyan-400 border-cyan-500',
              icon: Anchor,
              text: '底部蓄势'
          };
      } else {
          return {
              style: 'bg-slate-800 text-slate-400 border-slate-600',
              icon: MoreHorizontal,
              text: '盘整震荡'
          };
      }
  };

  const slopeConfig = getSlopeBadge(data.slope || 0); // Default to 0 if undefined
  const SlopeIcon = slopeConfig.icon;

  return (
    <div className="w-full bg-slate-850 border border-slate-800 rounded-xl overflow-hidden mb-6 shadow-xl hover:border-slate-700 transition-all">
      
      {/* Header Section */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
             <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">{data.symbol}</h2>
                <span className="text-sm text-slate-400">{data.name}</span>
             </div>
             {/* Slope Badge */}
             <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${slopeConfig.style}`}>
                 <SlopeIcon size={12} />
                 <span>评分: {data.slope?.toFixed(2)} ({slopeConfig.text})</span>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-3xl font-mono text-white tracking-tighter">{data.price.toFixed(2)}</span>
            
            <div className="flex flex-col">
                <span className={`px-2 py-0.5 rounded text-sm font-bold ${data.change_percent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {data.change_percent >= 0 ? '+' : ''}{data.change_percent}%
                </span>
            </div>
            
            <div className="h-8 w-px bg-slate-700 mx-2"></div>

            <div className="flex flex-col text-xs text-slate-500 gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">市值: {data.market_cap}</span>
                    {data.volume && <span className="text-slate-500 border-l border-slate-700 pl-2">量: {data.volume}</span>}
                </div>
                <span className="flex items-center gap-1 text-emerald-500/80">
                    <Clock size={10} />
                    {data.quote_time || 'Live'} (实时)
                </span>
            </div>
          </div>
        </div>

        {/* Chart Sparkline Placeholder */}
        <div className="hidden md:block w-32 h-12">
            {/* Simple SVG Sparkline representation */}
            <svg viewBox="0 0 100 30" className={`w-full h-full fill-none stroke-2 ${data.charts?.trend === 'down' ? 'stroke-red-500' : 'stroke-emerald-500'}`}>
                {data.charts?.trend === 'down' 
                   ? <path d="M0 5 C 20 5, 20 20, 40 15 S 60 5, 80 25 L 100 28" />
                   : <path d="M0 25 C 20 25, 20 10, 40 15 S 60 25, 80 5 L 100 2" />
                }
            </svg>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tags & AI Logic */}
        <div className="lg:col-span-7 space-y-5">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, idx) => (
                    <span 
                        key={idx} 
                        className={`text-xs px-2 py-1 rounded border ${
                            tag.type === 'bullish' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' : 
                            tag.type === 'neutral' ? 'bg-blue-950/30 border-blue-800 text-blue-400' :
                            tag.type === 'bearish' ? 'bg-red-950/30 border-red-800 text-red-400' :
                            'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                    >
                        {tag.label}
                    </span>
                ))}
            </div>

            {/* Event Analysis */}
            {data.analysis.event_content && (
                <div className="bg-orange-950/20 border border-orange-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 text-orange-400 text-sm font-bold uppercase">
                        <Zap size={14} />
                        <span>{data.analysis.event_title || '重大事件'}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {data.analysis.event_content}
                    </p>
                </div>
            )}

            {/* AI Logic */}
            <div>
                <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-bold">
                    <Sparkles size={14} />
                    <span>AI 选股逻辑 & 题材</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed pl-6 border-l-2 border-slate-800">
                    {data.analysis.ai_logic}
                </p>
            </div>
        </div>

        {/* Right Column: Diagnostics */}
        <div className="lg:col-span-5 space-y-5">
            
            {/* Technical Diagnosis */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                        <Activity size={14} />
                        <span>薛斯通道 & LXHJ 战法诊断</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    {data.analysis.tech_diagnosis}
                </p>
            </div>

             {/* Fund Analysis */}
             <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                        <DollarSign size={14} />
                        <span>资金面分析</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    {data.analysis.fund_analysis}
                </p>
            </div>

        </div>
      </div>

      {/* Footer: Sources */}
      {data.sources && data.sources.length > 0 && (
          <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-3 overflow-hidden">
             <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">数据来源 (yfinance Proxy):</span>
             <div className="flex gap-4 overflow-x-auto no-scrollbar">
                 {data.sources.map((source, idx) => (
                     <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline whitespace-nowrap transition-colors"
                     >
                        <ExternalLink size={10} />
                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                     </a>
                 ))}
             </div>
          </div>
      )}
    </div>
  );
};

export default StockCard;