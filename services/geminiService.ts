import { GoogleGenAI } from "@google/genai";
import { StockData, MarketType } from "../types";

const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON", e);
      return null;
    }
  }
  const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
        console.error("Failed to parse fallback JSON", e);
        return null;
    }
  }
  return null;
};

export const fetchStockAnalysis = async (
  market: MarketType,
  selectedSectors: string[],
  activeFactors: string[],
  customQuery: string,
  timeHorizon: string,
  marketCapPrompt: string
): Promise<StockData[]> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const factorList = activeFactors.join(", ");
    const sectorList = selectedSectors.join(", ");
    
    // Check if the user specifically requested "Major Catalyst" (Event Driven)
    const isCatalystDriven = activeFactors.includes('重大利好/事件驱动');

    const prompt = `
      请扮演一位精通 "薛斯通道 (Xuesi Channel)" 和 "LXHJ (主力资金)" 战法的中国量化交易员。
      利用Google搜索对 ${market} 进行深度扫描。
      
      **核心筛选条件:**
      ${isCatalystDriven ? "0. **最高优先级 (CRITICAL)**: 必须筛选近期(近1个月)发布过重大公告(重组/大额中标/战略合作/回购)的股票。如果没有实质性利好，不要入选。" : ""}
      1. 市值要求: ${marketCapPrompt} (必须严格遵守)。
      2. 板块/题材: ${sectorList || "当前市场热门题材"}。
      3. 时间范围: 重点分析 ${timeHorizon} 的走势。
      4. 策略因子: ${factorList} ${customQuery ? `, ${customQuery}` : ''}。

      **PDF战法技术特征匹配 (必须严格对应):**
      - **"薛斯通道底部爆发"**: 寻找长期横盘后，日线/60分钟通道(紫线)极度收窄(Flat)后，K线突然放量突破紫线。
      - **"LXHJ 强势主力"**: 寻找主力控盘线(黄线)位于上方高位，且与资金流向产生共振。
      - **"60分钟共振"**: 寻找日线级别紫线走平或向上，且60分钟级别同时出现金叉或突破信号。

      **任务:**
      筛选 4-5 只最符合条件的股票，并返回JSON格式。
      
      **数据结构要求 (JSON):**
      - "ticker": 股票代码
      - "name": 股票名称
      - "price": 当前价格
      - "changePercent": 涨跌幅 (number)
      - "marketCap": 市值 (例如 "45亿")
      - "netInflowAmount": 主力/北向资金净流入金额 (例如 "+1.2亿", 必须寻找准确数字)
      - "trendPoints": 20个数字的数组，模拟近期K线走势。**重要**: 
          - 如果是"底部爆发"，数组前15个应平缓，最后5个急剧拉升。
          - 如果是"顶部调整"，数组最后应出现回调。
      - "reasoning": 简述选股理由。
      - "latestPositiveNews": string (**严格要求**: 必须是具体的公司级利好事件，如：**"与华为签订战略合作协议"**, **"拟收购XX科技公司"**, **"中标5亿重大合同"**, **"产品获得FDA认证"**。不要返回通用的行业新闻。若无具体事件，请返回 "无重大公告")。
      - "flowAnalysis": 资金面详细分析。
      - "technical": 对象，包含PDF战法指标:
          - "xsStatus": string ('底部爆发', '强势上涨', '高位调整', '通道收敛')
          - "xsDescription": string (描述紫线状态，如"紫线走平，K线突破上轨")
          - "lxhjStatus": string ('黄线高位控盘', '黄线金叉', '黄线背离', '资金流出')
          - "resonance60m": boolean (是否60分钟共振)
          - "channelWidth": number (0-100, 0=极度收窄/蓄势, 100=开口过大/风险)

      请严格只返回 JSON 数据。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const parsedData = extractJson(text);

    if (!parsedData || !Array.isArray(parsedData)) {
      throw new Error("未能生成有效的量化分析数据，请调整筛选条件重试。");
    }

    const sources = grounding
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any) => s !== null) || [];

    const enrichedData: StockData[] = parsedData.map((item: any, index: number) => ({
      ...item,
      market: market,
      sources: index === 0 ? sources : [] 
    }));

    return enrichedData;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};