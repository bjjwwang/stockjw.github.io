import React from 'react';
import { AreaChart, Area, Line, ComposedChart, ResponsiveContainer, YAxis } from 'recharts';

interface TrendChartProps {
  data: number[];
  color?: string;
  isExplosive?: boolean; 
  lxhjStatus?: string; // To determine Yellow line behavior
}

const TrendChart: React.FC<TrendChartProps> = ({ data, color = "#10b981", isExplosive = false, lxhjStatus }) => {
  
  // Create synthetic data to simulate the specific technical indicators from the PDF
  const chartData = data.map((val, idx) => {
    // 1. Purple Line (薛斯通道大通道上轨):
    // If explosive, the price (val) should break ABOVE the purple line at the end.
    // If consolidating, the purple line should be flat and close to price.
    let purpleLine = val; 
    
    if (isExplosive) {
        // Price breaks out, so Purple Line lags slightly below price at the end, 
        // but was capping the price earlier.
        if (idx < data.length - 5) {
            purpleLine = val * 1.02; // Cap above price
        } else {
            purpleLine = val * 0.98; // Price breaks above
        }
    } else {
        // Normal uptrend or consolidation
        purpleLine = val * 1.05; // Standard upper rail
    }

    // 2. Yellow Line (LXHJ Main Force Control):
    // If status is "High Control" (高位控盘), Yellow line should be high and stable.
    // If status is "Gold Cross" (金叉), Yellow line should cross upward.
    const isHighControl = lxhjStatus?.includes('高位') || lxhjStatus?.includes('控盘');
    let yellowLine = 0;
    
    // Normalize price to 0-100 scale for the oscillator simulation, then map back roughly
    const base = val * 0.9; 
    if (isHighControl) {
        yellowLine = base + (val * 0.05); // High position
    } else {
        // Oscillating upwards
        yellowLine = base + (val * 0.05 * (idx / data.length));
    }

    return {
      i: idx,
      val,
      purple: purpleLine,
      yellow: yellowLine,
      // Faint background channel
      upper: purpleLine * 1.02,
      lower: val * 0.95
    };
  });

  return (
    <div className="h-20 w-40 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <YAxis domain={['auto', 'auto']} hide />
          
          {/* Background Area */}
          <Area 
            type="monotone" 
            dataKey="upper" 
            stackId="1"
            stroke="none" 
            fill="url(#colorFill)" 
          />

          {/* XS Channel Purple Line (薛斯通道紫线) */}
          <Line 
            type="monotone" 
            dataKey="purple" 
            stroke="#c084fc" // Purple-400
            strokeWidth={1.5} 
            dot={false}
            strokeDasharray="3 3"
          />

           {/* LXHJ Yellow Line (主力控盘黄线) - Draw it slightly offset or as a secondary indicator feel */}
           <Line 
            type="monotone" 
            dataKey="yellow" 
            stroke="#facc15" // Yellow-400
            strokeWidth={1.5} 
            dot={false}
          />

          {/* Main Price Line */}
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2.5} 
            dot={false} 
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Legend for the Chart specific to PDF */}
      <div className="absolute bottom-0 right-0 flex gap-2 text-[8px] bg-slate-900/80 px-1 rounded">
         <span className="text-purple-400">● 紫线(上轨)</span>
         <span className="text-yellow-400">● 黄线(主力)</span>
      </div>
    </div>
  );
};

export default TrendChart;