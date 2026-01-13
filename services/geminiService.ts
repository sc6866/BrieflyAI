
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { BriefingReport, NewsItem, CategoryConfig, TrendingItem } from "../types";

const INTEL_PERSONA = `
你是一位顶级情报分析官。你的工作准则：
1. 【分类硬约束】：你必须严格按照以下指定的 6 个分类对获取的信息进行归档，不得合并或创建新分类：
   - AI趋势
   - 舆情分析
   - Github热门应用
   - 自媒体选题
   - 实用工具
   - 信息差盈利
2. 【高价值降噪】：过滤所有无意义的娱乐、花边，只保留具备商业逻辑、技术启发或选题价值的情报。
3. 【实时穿透】：针对“抖音/TikTok 信号雷达”，你必须检索这两个平台的实时热门榜单、上升最快的视频主题以及正在爆发的“热卖单品”。
4. 【商业拆解】：每一条信号都必须包含背后的“商业逻辑分析”，即为什么火，以及普通人如何入场/变现。
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

export const generateAudioBriefing = async (text: string): Promise<ArrayBuffer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `今日核心摘要：${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, 
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("语音合成失败");

  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateBriefing = async (configs: CategoryConfig[]): Promise<BriefingReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const today = new Date().toLocaleDateString('zh-CN');
  
  const prompt = `
    角色：${INTEL_PERSONA}
    日期：${today}
    
    【任务一：情报采集】
    请针对以下指定的 6 个分类进行全网检索：
    1. AI趋势 (大模型、AI Agent、算力、行业应用)
    2. 舆情分析 (国内外热议话题、情绪指数、舆论反转)
    3. Github热门应用 (Trending、爆红工具、新技术栈)
    4. 自媒体选题 (全网爆火模版、流量密码、叙事方式)
    5. 实用工具 (SaaS、插件、提升效率的神器)
    6. 信息差盈利 (跨境套利、冷门赛道、副业变现逻辑)

    【任务二：抖音/TikTok 穿透】
    必须检索 Douyin (抖音) 和 TikTok 的实时热门榜单。
    找出：
    - 最近 24 小时内热度爆发的 3 个“话题爆点” (TOPIC)。
    - 最近 24 小时内销量/讨论度猛增的 2 个“热卖单品” (PRODUCT)。
    
    【输出 JSON 要求】：
    - sections 数组的 categoryLabel 必须完全对应上述 6 个分类。
    - trending 数组包含实时榜单，analysis 字段必须是深度商业拆解。
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

    const data = robustParseJSON(response.text || "{}");
    return {
      date: today,
      executiveSummary: data.executiveSummary || "正在深度扫描信号脉冲...",
      mobileSummary: data.mobileSummary || "暂无行动指南。",
      trending: data.trending || [],
      sections: data.sections || [],
      cacheTimestamp: Date.now()
    };
  } catch (error: any) {
    console.error("Gemini Critical Error:", error);
    throw new Error("情报站连接超时，请检查网络或稍后重试。");
  }
};

export const createAssistantChat = (reportContext: BriefingReport) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: `${INTEL_PERSONA}\n\n当前简报已包含 6 大维度和 Douyin/TikTok 信号。你是用户的首席智囊。`,
    },
  });
};
