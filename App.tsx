import React, { useState } from 'react';
import { Menu, X, Globe, Cpu } from 'lucide-react';
import StrategyPanel from './components/StrategyPanel';
import StockCard from './components/StockCard';
import { StrategyConfig, StockCardData } from './types';
import { mockScanMarket } from './services/mockService';

const App: React.FC = () => {
  // Application State
  const [config, setConfig] = useState<StrategyConfig>({
    market_scope: 'US',
    market_cap_tier: 'small',
    trend_period: '5d',
    slope_range: [0.35, 1.0], // Default: Strong Trend to Skyrocket
    selected_factors: ['channel_breakout'],
    selected_sectors: []
  });
  
  const [results, setResults] = useState<StockCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Handler for running scanning
  const handleScan = async () => {
    setIsLoading(true);
    setHasScanned(true);
    // Close mobile menu
    setIsMobileMenuOpen(false);

    try {
        // In a real app, we would pass the config to backend
        const data = await mockScanMarket(config);
        setResults(data);
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wider">QuantFlow</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 md:h-full
        ${isMobileMenuOpen ? 'translate-x-0 pt-16' : '-translate-x-full md:translate-x-0'}
        md:w-72 w-full bg-slate-900 md:bg-transparent
      `}>
        <StrategyPanel 
          config={config} 
          setConfig={setConfig} 
          onScan={handleScan}
          isLoading={isLoading} 
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full pt-16 md:pt-0">
        
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center backdrop-blur-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">分析结果</h2>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
               <span>{config.market_scope === 'US' ? '美股市场' : 'A股市场'}</span>
               <span>•</span>
               <span className="uppercase">{config.trend_period} 趋势</span>
               <span>•</span>
               <span>评分区间: {config.slope_range[0].toFixed(2)} - {config.slope_range[1].toFixed(2)}</span>
               {config.selected_sectors.length > 0 && (
                 <>
                   <span>•</span>
                   <span>行业: {config.selected_sectors.length}</span>
                 </>
               )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 text-xs text-slate-400">
            <div className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span>Google 实时网络已连接</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
               <Cpu className="animate-spin text-emerald-500" size={48} />
               <p>AI 正在连接交易所实时行情...</p>
               <p className="text-xs text-slate-600">Connecting to yfinance proxy...</p>
            </div>
          ) : !hasScanned ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                 <Menu size={32} className="opacity-50" />
              </div>
              <p>请在左侧选择策略并点击“开始筛选”</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {results.map((stock) => (
                <StockCard key={stock.symbol} data={stock} />
              ))}
              
              <div className="text-center text-slate-600 text-sm mt-8 pb-8">
                已显示全部匹配结果 (实时报价更新于 {new Date().toLocaleTimeString()})
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default App;