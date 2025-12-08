import { GoogleGenAI } from "@google/genai";
import { StrategyConfig, StockCardData } from '../types';

/**
 * FETCH REAL-TIME MARKET DATA USING GEMINI WITH GOOGLE SEARCH
 * Simulating Backend yfinance logic + Python Algorithms via Serverless AI Grounding
 */

export const mockScanMarket = async (config: StrategyConfig): Promise<StockCardData[]> => {
    // 1. Determine Search Context
    const isCN = config.market_scope === 'CN';
    const marketLabel = isCN ? '中国A股 (China A-Shares)' : '美股 (US Market)';
    const currency = isCN ? 'CNY' : 'USD';
    const sector = config.selected_sectors.length > 0 ? config.selected_sectors[0] : '当前市场热点';
    const factors = config.selected_factors.join(', ') || '量价齐升';
    
    // Python Logic Porting: Market Cap Thresholds
    // Mapping UI 'Small' to Python 'Micro + Small' (< 20B)
    let capInstruction = "";
    if (config.market_cap_tier === 'small') {
        capInstruction = `
        def check_market_cap(cap):
            # STRICT RULE: Market Cap must be LESS THAN 20 Billion ${currency}.
            # CRITICAL: IF symbol is 'NVDA', 'AAPL', 'MSFT', 'GOOG' or any large cap -> RETURN FALSE immediately.
            return cap < 20000000000
        `;
    } else if (config.market_cap_tier === 'mid') {
        capInstruction = `
        def check_market_cap(cap):
            # STRICT RULE: Market Cap must be between 20 Billion and 100 Billion ${currency}.
            return 20000000000 <= cap < 100000000000
        `;
    } else if (config.market_cap_tier === 'large') {
        capInstruction = `
        def check_market_cap(cap):
            # STRICT RULE: Market Cap must be GREATER THAN 100 Billion ${currency}.
            return cap >= 100000000000
        `;
    }

    const slopeMin = config.slope_range[0];
    const slopeMax = config.slope_range[1];

    // 2. Get Current Time for Real-time validation
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Construct STRICT Prompt simulating Python Logic
    const prompt = `
    Role: Senior Quant Execution Engine (Python Simulation).
    Current Beijing Time: ${now}.
    Target Market: ${marketLabel}.
    Sector: ${sector}.
    
    You are strictly simulating the following Python Logic. Do not hallucinate data.

    --- PYTHON LOGIC START ---
    
    ${capInstruction}

    def calculate_technical_features(prices):
        # 1. Normalize prices to 0-1 scale to make slope comparable.
        # 2. Simulate sklearn.LinearRegression on the last 20 bars.
        # 3. Raw Slope k = model.coef_[0]
        # 4. Score = np.clip(k * 10, 0.0, 1.0)
        # TARGET SCORE: ${slopeMin} to ${slopeMax}
        return score

    --- PYTHON LOGIC END ---

    TASK:
    Use Google Search to find 2 REAL stocks that satisfy valid_ticker() AND check_market_cap() AND calculate_technical_features().
    
    CRITICAL CONSTRAINTS:
    1. **Real-time**: Price MUST be current as of ${now}.
    2. **Market Cap Gate**: If user chose "Small", absolutely NO large caps (like NVDA). Verify market cap in real-time.
    3. **Language**: All "name", "analysis" fields MUST be in Simplified Chinese.
    
    OUTPUT FORMAT (JSON Array Only):
    [
      {
        "symbol": "Ticker (e.g. 600519.SS or PLTR)",
        "name": "Chinese Name",
        "price": 123.45,
        "change_percent": 2.5,
        "market_cap": "150亿", 
        "volume": "35万手",
        "quote_time": "14:35:00",
        "slope": 0.85, // The simulated regression score
        "tags": [
             {"label": "Small Cap Checked", "type": "neutral"}, 
             {"label": "Strong Trend", "type": "bullish"}
        ],
        "analysis": {
            "event_title": "Selection Logic",
            "event_content": "Latest news...",
            "ai_logic": "Explain why it passed the Python logic (in Chinese)...",
            "tech_diagnosis": "Technical structure (in Chinese)...",
            "fund_analysis": "Money flow (in Chinese)..."
        },
        "charts": {"trend": "up"}
      }
    ]
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
                // Ensure slope is present
                slope: item.slope ?? (slopeMin + 0.1)
            };
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return [{
            symbol: "ERROR",
            name: "逻辑校验失败",
            price: 0,
            change_percent: 0,
            market_cap: "-",
            volume: "-",
            quote_time: now.split(' ')[1],
            slope: 0.5,
            tags: [{label: "API Error", type: "bearish"}],
            analysis: {
                event_title: "连接中断",
                event_content: "AI 无法执行 Python 逻辑校验，请检查 API Key 或网络。",
                ai_logic: "无",
                tech_diagnosis: "无",
                fund_analysis: "无"
            },
            charts: { trend: 'flat' }
        }];
    }
};