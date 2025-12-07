import { GoogleGenAI } from "@google/genai";
import { StrategyConfig, StockCardData } from '../types';

/**
 * FETCH REAL-TIME MARKET DATA USING GEMINI WITH GOOGLE SEARCH
 * Simulating Backend yfinance logic via Serverless AI Grounding
 */

export const mockScanMarket = async (config: StrategyConfig): Promise<StockCardData[]> => {
    // 1. Determine Search Context
    const isCN = config.market_scope === 'CN';
    const marketLabel = isCN ? '中国A股 (China A-Shares)' : '美股 (US Market)';
    const sector = config.selected_sectors.length > 0 ? config.selected_sectors[0] : '当前市场热点';
    const factors = config.selected_factors.join(', ') || '量价齐升';
    const cap = config.market_cap_tier === 'all' ? '' : `市值: ${config.market_cap_tier}`;
    const slopeMin = config.slope_range[0];
    const slopeMax = config.slope_range[1];

    // 2. Get Current Time for Real-time validation
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Construct STRICT Prompt for Real-Time Data (Simulating yfinance)
    const prompt = `
    Role: Financial Data API Proxy (Simulating yfinance).
    Context: The user demands REAL-TIME market data.
    Current Beijing Time: ${now}.
    
    Target: Find 2 distinct stocks in ${marketLabel} related to "${sector}".
    
    LOGIC REQUIREMENT (Python Simulation):
    - Identify valid tickers.
    - If A-Share (6 digits): Append .SS (Shanghai) if starts with '6', else .SZ (Shenzhen).
    - Fetch LATEST price, change %, VOLUME, and market cap.
    
    CRITICAL CRITERIA:
    1. **REAL-TIME PRICE**: Use Google Search to find the price at this exact moment (${now}).
    2. **QUOTE TIME**: Must be specific (e.g., "14:35:12"). If market is closed, state "收盘".
    3. **STATUS**: Must show "${factors}" pattern.
    4. **SLOPE**: Trend score between ${slopeMin} and ${slopeMax}.
    
    Output Format:
    Return a valid JSON array ONLY.
    
    interface StockData {
      symbol: string; // Keep raw ticker here (e.g. 600519), we handle suffix in post-processing.
      name: string; // Chinese Name
      price: number; // REAL-TIME PRICE
      change_percent: number; // REAL-TIME CHANGE
      market_cap: string;
      volume: string; // e.g. "成交量: 30万手" or "Vol: 10M"
      quote_time: string; // Timestamp of the data
      slope: number; // Estimated trend strength (${slopeMin}-${slopeMax})
      tags: { label: string; type: 'bullish' | 'bearish' | 'neutral' | 'event' }[];
      analysis: {
        event_title: string;
        event_content: string; 
        ai_logic: string; // Why selected (Chinese)
        tech_diagnosis: string; // Technical analysis (Chinese)
        fund_analysis: string; // Money flow (Chinese)
      };
      charts: { trend: 'up' | 'down' | 'flat' };
    }
    
    Strictly verify data. Output in Simplified Chinese.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text || "";
        
        // Extract Sources
        const sources: {title: string, uri: string}[] = [];
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({
                        title: chunk.web.title,
                        uri: chunk.web.uri
                    });
                }
            });
        }

        // Parse JSON
        let parsedData: StockCardData[] = [];
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                parsedData = JSON.parse(jsonStr);
            } catch (e) {
                console.error("JSON Parse Error:", e);
            }
        }

        // Validate and Format using the Python Logic for Suffixes
        return parsedData.map(item => {
            let finalSymbol = item.symbol;
            
            // Logic: if ticker.isdigit() and len(ticker) == 6
            if (isCN && /^\d{6}$/.test(item.symbol)) {
                // ticker = f"{ticker}.SS" if ticker.startswith("6") else f"{ticker}.SZ"
                finalSymbol = item.symbol.startsWith('6') ? `${item.symbol}.SS` : `${item.symbol}.SZ`;
            }

            return {
                ...item,
                symbol: finalSymbol,
                sources: sources.slice(0, 3),
                slope: item.slope ?? (slopeMin + 0.1)
            };
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return [{
            symbol: "ERROR",
            name: "数据同步失败",
            price: 0,
            change_percent: 0,
            market_cap: "-",
            volume: "-",
            quote_time: now.split(' ')[1],
            slope: 0.5,
            tags: [{label: "API Error", type: "bearish"}],
            analysis: {
                event_title: "连接中断",
                event_content: "无法连接到实时行情代理，请检查网络。",
                ai_logic: "无",
                tech_diagnosis: "无",
                fund_analysis: "无"
            },
            charts: { trend: 'flat' }
        }];
    }
};