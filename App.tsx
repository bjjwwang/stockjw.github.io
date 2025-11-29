import React, { useState } from 'react';
import { PRESET_FACTORS, TIME_HORIZONS, MARKET_CAP_OPTIONS } from './constants';
import { MarketType, StockData } from './types';
import { fetchStockAnalysis } from './services/geminiService';
import FactorButton from './components/FactorButton';
import StockCard from './components/StockCard';
import SectorSelector from './components/SectorSelector';
import { Search, Loader2, BarChart2, Globe, Cpu, AlertCircle, Clock, Layers, Filter, Activity, ArrowRightLeft, Newspaper } from 'lucide-react';

const App: React.FC = () => {
  const [market, setMarket] = useState<MarketType>(MarketType.CN);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [timeHorizon, setTimeHorizon] = useState<string>('5d');
  const [marketCapId, setMarketCapId] = useState<string>('all');
  const [customQuery, setCustomQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<StockData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleFactor = (id: string) => {
    setSelectedFactors(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleSector = (name: string) => {
    setSelectedSectors(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleAnalyze = async () => {
    if (selectedFactors.length === 0 && selectedSectors.length === 0 && !customQuery.trim()) {
      setError("请至少选择一个板块、一个策略因子，或输入自定义选股条件。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const capOption = MARKET_CAP_OPTIONS.find(c => c.id === marketCapId);
      
      const data = await fetchStockAnalysis(
        market, 
        selectedSectors,
        selectedFactors, 
        customQuery, 
        TIME_HORIZONS.find(t => t.value === timeHorizon)?.label || '近5日',
        capOption?.prompt || "不限制市值"
      );
      setResults(data);
    } catch (err: any) {
      setError(err.message || "分析过程中发生未知错误。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Group factors for display
  const technicalFactors = PRESET_FACTORS.filter(f => f.category === '技术面');
  const flowFactors = PRESET_FACTORS.filter(f => f.category === '资金面');
  const fundamentalFactors = PRESET_FACTORS.filter(f => f.category === '基本面');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-blue-600 p-2 rounded-lg">
              <Cpu size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                量化流 AI (QuantFlow)
              </h1>
              <p className="text-xs text-slate-400">薛斯通道 & LXHJ 战法增强版</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Globe size={12} className="text-emerald-500" />
            <span className="text-xs text-slate-400 font-mono">
              数据源: Google Search Grounding
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Market Selection */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} /> 市场范围
            </h2>
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[MarketType.CN, MarketType.US].map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`
                    py-2 px-3 rounded-lg text-xs font-medium transition-all
                    ${market === m 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                      : 'text-slate-500 hover:text-slate-300'
                    }
                  `}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* Market Cap & Time Horizon */}
          <div className="grid grid-cols-2 gap-4">
             <section>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Filter size={14} /> 市值筛选
                </h2>
                <select 
                    value={marketCapId}
                    onChange={(e) => setMarketCapId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                >
                    {MARKET_CAP_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
             </section>
             <section>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={14} /> 趋势周期
                </h2>
                <select 
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                >
                    {TIME_HORIZONS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
             </section>
          </div>

          {/* Sector Selection */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} /> 目标板块 / 题材
            </h2>
            <SectorSelector selectedSectors={selectedSectors} onToggle={toggleSector} />
          </section>

          {/* Factor Selection - Grouped */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 size={14} /> 战法与因子 (PDF策略)
            </h2>
            
            <div className="space-y-6">
              {/* 1. Technical */}
              <div>
                <h3 className="text-[10px] text-purple-400 font-bold uppercase mb-2 ml-1 flex items-center gap-1.5">
                  <Activity size={12} /> 技术面 (薛斯/趋势)
                </h3>
                <div className="space-y-2">
                  {technicalFactors.map(factor => (
                    <FactorButton 
                      key={factor.id}
                      factor={factor}
                      isSelected={selectedFactors.includes(factor.name)} 
                      onClick={() => toggleFactor(factor.name)}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Flow */}
              <div>
                 <h3 className="text-[10px] text-blue-400 font-bold uppercase mb-2 ml-1 flex items-center gap-1.5">
                  <ArrowRightLeft size={12} /> 资金面 (LXHJ/主力)
                </h3>
                <div className="space-y-2">
                  {flowFactors.map(factor => (
                    <FactorButton 
                      key={factor.id}
                      factor={factor}
                      isSelected={selectedFactors.includes(factor.name)} 
                      onClick={() => toggleFactor(factor.name)}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Fundamental */}
              <div>
                 <h3 className="text-[10px] text-orange-400 font-bold uppercase mb-2 ml-1 flex items-center gap-1.5">
                  <Newspaper size={12} /> 基本面 (消息/题材)
                </h3>
                <div className="space-y-2">
                  {fundamentalFactors.map(factor => (
                    <FactorButton 
                      key={factor.id}
                      factor={factor}
                      isSelected={selectedFactors.includes(factor.name)} 
                      onClick={() => toggleFactor(factor.name)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Custom Query */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              自定义条件
            </h2>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="补充说明：例如 '一定要有60分钟底背离'..."
              className="w-full h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </section>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
              ${isAnalyzing 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white shadow-lg shadow-emerald-900/20'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" /> 正在扫描技术形态...
              </>
            ) : (
              <>
                <Search size={20} /> 开始智能选股
              </>
            )}
          </button>
          
          {error && (
             <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-rose-300">{error}</p>
             </div>
          )}
        </div>

        {/* Right Content: Results */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">分析结果</h2>
            {results && (
                <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    {TIME_HORIZONS.find(t => t.value === timeHorizon)?.label} | {MARKET_CAP_OPTIONS.find(c => c.id === marketCapId)?.label}
                </span>
            )}
          </div>

          {!results && !isAnalyzing && !error && (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <BarChart2 size={48} className="text-slate-700 mb-4" />
              <p className="text-slate-500 text-center max-w-sm">
                左侧配置筛选条件：请尝试选择 "薛斯通道底部爆发" 和 "中盘股"，体验PDF战法选股。
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>
               ))}
            </div>
          )}

          <div className="space-y-4">
            {results?.map((stock, idx) => (
              <StockCard key={idx} stock={stock} />
            ))}
          </div>
          
          {/* Sources Footnote */}
          {results && results.length > 0 && results[0].sources && results[0].sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">数据来源 (Google 搜索支持)</h4>
              <div className="flex flex-wrap gap-2">
                {results[0].sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;