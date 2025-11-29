import React from 'react';
import { TechnicalAnalysis } from '../types';
import { Activity, Layers, Zap, TrendingUp, Minimize2, BarChart2 } from 'lucide-react';

interface Props {
  data: TechnicalAnalysis;
}

const TechAnalysisPanel: React.FC<Props> = ({ data }) => {
  // Determine color for channel width
  const channelWidthColor = data.channelWidth < 30 ? 'bg-emerald-500' : data.channelWidth < 70 ? 'bg-blue-500' : 'bg-orange-500';

  return (
    <div className="mt-3 bg-slate-950/40 rounded-lg p-3 border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Activity size={12} className="text-purple-400" />
          薛斯通道 & LXHJ 战法诊断
        </h4>
        {data.resonance60m && (
          <span className="text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-purple-900/50">
            <Zap size={10} fill="currentColor" />
            60分钟级别共振
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* XS Channel Status */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300"><Minimize2 size={10} className="text-purple-400" /> 薛斯通道(紫线)</span>
            <span className="text-purple-300">{data.xsStatus}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${channelWidthColor} transition-all duration-500`} 
              style={{ width: `${Math.max(10, data.channelWidth)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5 border-l-2 border-slate-700 pl-2">
            {data.xsDescription || "关注紫线方向及开口变化"}
          </p>
        </div>

        {/* LXHJ Status */}
        <div className="space-y-1.5">
           <div className="flex justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300"><Layers size={10} className="text-yellow-400" /> LXHJ(黄线)</span>
            <span className={data.lxhjStatus.includes('控盘') || data.lxhjStatus.includes('金叉') ? 'text-yellow-400' : 'text-slate-400'}>
              {data.lxhjStatus}
            </span>
          </div>
          {/* Visual Indicator for LXHJ Strength */}
          <div className="flex items-center gap-1">
             <div className={`h-1.5 flex-1 rounded-full ${data.lxhjStatus.includes('控盘') ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'bg-slate-700'}`}></div>
             <div className={`h-1.5 flex-1 rounded-full ${data.lxhjStatus.includes('金叉') ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
             <div className={`h-1.5 flex-1 rounded-full bg-slate-700`}></div>
          </div>
           <p className="text-[10px] text-slate-500 leading-tight mt-0.5 border-l-2 border-slate-700 pl-2">
             {data.lxhjStatus.includes('金叉') ? '黄线上穿白线 (买点确认)' : 
              data.lxhjStatus.includes('控盘') ? '主力高位控盘 (持股)' : '主力资金监控中'}
           </p>
        </div>
      </div>
    </div>
  );
};

export default TechAnalysisPanel;