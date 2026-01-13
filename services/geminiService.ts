import { GoogleGenAI, Modality, Type } from "@google/genai";
import { BriefingReport, NewsItem, CategoryConfig, TrendingItem } from "../types";

// 兼容多种环境的环境变量获取方式
const getApiKey = () => {
  try {
    // 优先从 Vite 的 import.meta.env 获取
    // @ts-ignore
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_API_KEY;
    if (viteKey) return viteKey;

    // 其次尝试 process.env (Docker 或 Node 环境)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;

    return "";
  } catch (e) {
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
    输出：请输出符合 schema 格式的 JSON。
  `;

  try {
    const response = await ai.models.generateContent({
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
      },
    });

    return robustParseJSON(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("同步失败：请确认 API Key 有效且已开启 Google Search 工具。");
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