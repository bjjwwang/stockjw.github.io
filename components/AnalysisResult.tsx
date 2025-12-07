import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, LineChart, BrainCircuit } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const AnalysisResultCard: React.FC<AnalysisResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-12 bg-slate-850 rounded-xl border border-slate-800 flex flex-col items-center justify-center animate-pulse">
        <BrainCircuit size={48} className="text-emerald-500 mb-4 animate-spin-slow" />
        <h3 className="text-lg text-slate-300 font-medium">QuantFlow AI 正在计算 K 线特征...</h3>
        <p className="text-slate-500 text-sm mt-2">正在运行线性回归与波动率模型</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-16 text-center text-slate-600">
        <LineChart size={64} className="mx-auto mb-4 opacity-20" />
        <p>请输入股票代码开始 AI 分析</p>
      </div>
    );
  }

  const isRejected = result.status.startsWith('REJECTED');
  
  // Status Banner Logic
  let statusBanner;
  if (result.status === 'ACCEPTED') {
    statusBanner = (
      <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4 flex items-center gap-3 text-emerald-400 mb-6">
        <CheckCircle2 size={24} />
        <div>
          <h3 className="font-bold">模型筛选通过</h3>
          <p className="text-xs opacity-80">符合当前趋势与平台策略，已生成 AI 报告。</p>
        </div>
      </div>
    );
  } else if (result.status === 'REJECTED_WEAK_TREND') {
    statusBanner = (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-400 mb-6">
        <XCircle size={24} />
        <div>
          <h3 className="font-bold">筛选未通过: 趋势疲软</h3>
          <p className="text-xs opacity-80">斜率 ({result.features.slope.toFixed(4)}) 低于设定的阈值。</p>
        </div>
      </div>
    );
  } else {
    statusBanner = (
      <div className="bg-orange-900/30 border border-orange-800 rounded-lg p-4 flex items-center gap-3 text-orange-400 mb-6">
        <AlertTriangle size={24} />
        <div>
          <h3 className="font-bold">筛选未通过: 形态松散</h3>
          <p className="text-xs opacity-80">未检测到有效的平台整理结构 (Standard Deviation High)。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{result.symbol}</h2>
          <span className="text-xs text-slate-500 font-mono">{result.timestamp}</span>
        </div>
        <div className="flex gap-2">
          {/* Feature Tags */}
          <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            Slope: <span className={result.features.slope > 0.5 ? "text-emerald-400" : "text-slate-400"}>{result.features.slope.toFixed(3)}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            Platform: <span className={result.features.is_platform ? "text-blue-400" : "text-slate-500"}>{result.features.is_platform ? "YES" : "NO"}</span>
          </div>
           <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            Price &gt; EMA: <span className={result.features.current_price > result.features.ema10 ? "text-emerald-400" : "text-red-400"}>{result.features.current_price > result.features.ema10 ? "YES" : "NO"}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {statusBanner}

        {/* AI Analysis Content - Only show if accepted or if user wants to see why rejected (optional, here we hide AI text on reject) */}
        {!isRejected && result.ai_analysis && (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
              <BrainCircuit size={20} className="text-purple-400" />
              <span className="font-semibold text-purple-400">Gemini AI 深度解析</span>
            </div>
            
            {/* Render Markdown-like content safely */}
            <div 
                className="whitespace-pre-line text-slate-300 leading-relaxed"
            >
                {result.ai_analysis}
            </div>
          </div>
        )}

        {isRejected && (
            <div className="text-center py-8 text-slate-500">
                <p>由于技术指标未达标，AI 代理已跳过深度分析以节省算力。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResultCard;