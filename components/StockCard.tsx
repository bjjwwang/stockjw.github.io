import React from 'react';
import { StockData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, ArrowRightLeft, Database, Megaphone, Zap, FileText } from 'lucide-react';
import TrendChart from './TrendChart';
import TechAnalysisPanel from './TechAnalysisPanel';

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const isPositive = stock.changePercent >= 0;
  const colorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const bgClass = isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10';

  const flowText = stock.netInflowAmount || "";
  const isFlowPositive = !flowText.includes("-") && (flowText.includes("+") || flowText.length > 0);
  const flowColor = isFlowPositive ? 'text-emerald-400' : 'text-rose-400';

  // Check if explosive pattern for chart visualization
  const isExplosive = stock.technical?.xsStatus.includes('爆发');

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">{stock.ticker}</h2>
            <span className="text-sm text-slate-400 truncate max-w-[150px] font-medium">{stock.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-3xl font-mono font-bold text-white tracking-tighter">{stock.price}</span>
            <span className={`flex items-center text-sm font-bold px-2.5 py-1 rounded-md ${bgClass} ${colorClass}`}>
              {isPositive ? <TrendingUp size={16} className="mr-1.5" /> : <TrendingDown size={16} className="mr-1.5" />}
              {isPositive ? '+' : ''}{stock.changePercent}%
            </span>
          </div>
          {stock.marketCap && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-slate-500 bg-slate-900/50 w-fit px-2 py-0.5 rounded">
                <Database size={12} />
                <span>市值: {stock.marketCap}</span>
            </div>
          )}
        </div>
        
        {/* Enhanced Chart with XS/LXHJ lines */}
        <TrendChart 
            data={stock.trendPoints} 
            color={isPositive ? '#34d399' : '#fb7185'} 
            isExplosive={isExplosive}
            lxhjStatus={stock.technical?.lxhjStatus}
        />
      </div>

      <div className="space-y-3">
        
        {/* MAJOR NEWS / CATALYST (Specific Events like M&A, Contracts) */}
        {stock.latestPositiveNews && stock.latestPositiveNews !== "无重大公告" && (
           <div className="relative overflow-hidden bg-gradient-to-r from-amber-900/20 to-slate-900/40 p-3 rounded-lg border border-amber-500/20 flex items-start gap-3">
              <div className="bg-amber-500/20 p-1.5 rounded-full shrink-0 mt-0.5">
                 <Megaphone size={16} className="text-amber-400" fill="currentColor" />
              </div>
              <div className="relative z-10">
                  <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center uppercase tracking-wider">
                    重大利好 / 催化剂 (Event)
                    <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  </h4>
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    {stock.latestPositiveNews}
                  </p>
              </div>
           </div>
        )}

        {/* AI Logic / Concept */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
          <FileText size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-wide block mb-0.5">AI 选股逻辑 & 题材</span>
            {stock.reasoning}
          </p>
        </div>

        {/* Technical Analysis Panel (PDF Features) */}
        {stock.technical && (
            <TechAnalysisPanel data={stock.technical} />
        )}

        {/* Capital Flow */}
        <div className="flex gap-3">
            {stock.netInflowAmount && stock.netInflowAmount !== "N/A" && stock.netInflowAmount !== "未知" && (
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-center min-w-[110px]">
                 <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <ArrowRightLeft size={12} />
                    <span>主力净流入</span>
                 </div>
                 <span className={`text-sm font-mono font-bold ${flowColor}`}>
                    {stock.netInflowAmount}
                 </span>
              </div>
            )}

            <div className="flex-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2.5">
                <DollarSign size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">资金面分析</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">{stock.flowAnalysis || "资金流向平稳。"}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;