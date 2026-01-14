import { GoogleGenAI, Modality, Type } from "@google/genai";
import { BriefingReport, NewsItem, CategoryConfig, TrendingItem } from "../types";

// 清理和验证 API Key，确保只包含有效的 ASCII 字符
const cleanApiKey = (key: string): string => {
  if (!key) return "";
  // 去除首尾空白字符、引号、换行符等
  let cleaned = key.trim()
    .replace(/^["']|["']$/g, '') // 去除首尾引号
    .replace(/\r?\n/g, '') // 去除换行符
    .replace(/\s+/g, ''); // 去除所有空白字符
  
  // 验证只包含 ASCII 字符（API Key 应该是纯 ASCII）
  if (!/^[\x00-\x7F]*$/.test(cleaned)) {
    console.warn("⚠️ API Key 包含非 ASCII 字符，已自动清理");
    // 只保留 ASCII 字符
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
  }
  
  return cleaned;
};

// 兼容多种环境的环境变量获取方式
const getApiKey = () => {
  try {
    // 优先从 Vite 的 import.meta.env 获取
    // @ts-ignore
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_API_KEY;
    if (viteKey) {
      const cleaned = cleanApiKey(String(viteKey));
      if (cleaned) return cleaned;
    }

    // 其次尝试 process.env (Docker 或 Node 环境)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      const cleaned = cleanApiKey(String(process.env.API_KEY));
      if (cleaned) return cleaned;
    }

    return "";
  } catch (e) {
    console.error("获取 API Key 时出错:", e);
    return "";
  }
};

const INTEL_PERSONA = `
你是一位顶级情报分析官。你的工作准则：
1. 【分类硬约束】：你必须严格按照指定的 6 个分类对信息进行归档。
2. 【高价值降噪】：只保留具备商业逻辑、技术启发或选题价值的情报。
3. 【实时穿透】：针对“抖音/TikTok 信号雷达”，检索实时热门榜单和爆款单品。
4. 【商业拆解】：每一条信号必须包含深度商业逻辑分析。
`;

const robustParseJSON = (text: string) => {
  try {
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);
  } catch (e) {
    console.error("JSON 解析失败:", text);
    throw new Error("情报解析异常，请稍后重试。");
  }
};

export const generateBriefing = async (configs: CategoryConfig[]): Promise<BriefingReport> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY 未配置，请在环境变量或配置中设置。");

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toLocaleDateString('zh-CN');
  
  const prompt = `
    角色：${INTEL_PERSONA}
    日期：${today}
    分类：AI趋势, 舆情分析, Github热门应用, 自媒体选题, 实用工具, 信息差盈利
    任务：检索上述 6 个领域的最新情报，并检索抖音/TikTok的实时热门。
    
    特别要求：
    - trending 数组必须包含抖音（Douyin）和 TikTok 两个平台的实时热点
    - 每个平台至少包含 5-10 条热点，包括：
      * 热门话题（TOPIC）：当前最热门的讨论话题、新闻事件、社会热点
      * 热卖单品（PRODUCT）：当前热销的商品、爆款产品、带货热门
    - 每条热点必须包含：排名、话题/商品名称、热度值、平台标识、商业分析、相关链接
    - 商业分析要深入，包含变现逻辑、流量密码、商业机会等
    
    输出：请输出符合 schema 格式的 JSON。
  `;

  // 重试函数，处理速率限制
  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, baseDelay = 2000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        const isRateLimit = error?.message?.includes('429') || 
                           error?.message?.toLowerCase().includes('rate limit') ||
                           error?.status === 429 ||
                           error?.code === 429;
        
        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // 指数退避：2s, 4s, 8s
          console.warn(`⚠️ 速率限制，${delay/1000}秒后重试 (${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  try {
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 15000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              mobileSummary: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    categoryLabel: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          summary: { type: Type.STRING },
                          source: { type: Type.STRING },
                          url: { type: Type.STRING },
                          impactScore: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              },
              trending: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    rank: { type: Type.NUMBER },
                    topic: { type: Type.STRING },
                    heat: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    analysis: { type: Type.STRING },
                    url: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["TOPIC", "PRODUCT"] }
                  }
                }
              }
            }
          }
        }
      });
    });

    return robustParseJSON(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // 提供更详细的错误信息
    let errorMessage = "同步失败：";
    
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429')) {
      errorMessage += "API 速率限制已触发，请稍后再试。";
    } else if (error?.status === 401 || error?.code === 401 || error?.message?.includes('401')) {
      errorMessage += "API Key 无效或已过期，请检查配置。";
    } else if (error?.status === 403 || error?.code === 403 || error?.message?.includes('403')) {
      errorMessage += "API Key 权限不足，请确认已开启 Google Search 工具。";
    } else if (error?.message) {
      errorMessage += error.message;
    } else {
      errorMessage += "请确认 API Key 有效且已开启 Google Search 工具。";
    }
    
    throw new Error(errorMessage);
  }
};

// 专门生成抖音和TikTok趋势数据的函数
export const generateTrendingData = async (): Promise<TrendingItem[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY 未配置，请在环境变量或配置中设置。");

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toLocaleDateString('zh-CN');
  
  const prompt = `
    角色：${INTEL_PERSONA}
    日期：${today}
    
    任务：专门检索抖音（Douyin）和 TikTok 两个平台的实时热点和热卖榜单。
    
    具体要求：
    1. 【抖音平台】：
       - 检索抖音热榜：当前最热门的话题、新闻、事件（至少 5 条）
       - 检索抖音热卖榜：当前热销商品、爆款单品、带货热门（至少 5 条）
       - 每条必须包含：排名、标题、热度值、商业分析、相关链接
    
    2. 【TikTok平台】：
       - 检索 TikTok 热门话题：当前全球最热门的挑战、话题、趋势（至少 5 条）
       - 检索 TikTok 热卖商品：当前热销产品、爆款单品（至少 5 条）
       - 每条必须包含：排名、标题、热度值、商业分析、相关链接
    
    3. 【商业分析要求】：
       - 每条热点必须包含深度商业逻辑分析
       - 分析变现逻辑、流量密码、商业机会
       - 提供可执行的商业建议
    
    输出：请输出符合以下格式的 JSON 数组，包含至少 20 条热点（抖音和TikTok各10条左右）：
    [
      {
        "rank": 1,
        "topic": "热点标题",
        "heat": "热度值（如：1000万+）",
        "platform": "抖音" 或 "TikTok",
        "analysis": "深度商业分析",
        "url": "相关链接",
        "type": "TOPIC" 或 "PRODUCT"
      }
    ]
  `;

  // 重试函数
  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, baseDelay = 2000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        const isRateLimit = error?.message?.includes('429') || 
                           error?.message?.toLowerCase().includes('rate limit') ||
                           error?.status === 429 ||
                           error?.code === 429;
        
        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`⚠️ 速率限制，${delay/1000}秒后重试 (${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  try {
    console.log('🔄 开始检索抖音和TikTok实时热点...');
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 15000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.NUMBER },
                topic: { type: Type.STRING },
                heat: { type: Type.STRING },
                platform: { type: Type.STRING },
                analysis: { type: Type.STRING },
                url: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["TOPIC", "PRODUCT"] }
              }
            }
          }
        }
      });
    });

    const trendingData = robustParseJSON(response.text || "[]");
    console.log(`✅ 成功检索到 ${Array.isArray(trendingData) ? trendingData.length : 0} 条热点`);
    return Array.isArray(trendingData) ? trendingData : [];
  } catch (error: any) {
    console.error("趋势数据检索失败:", error);
    throw new Error(`趋势数据检索失败: ${error.message || '未知错误'}`);
  }
};

export const createAssistantChat = (reportContext: BriefingReport) => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: `${INTEL_PERSONA}\n\n当前上下文包含今日研判报告。你是首席情报顾问。`,
    },
  });
};