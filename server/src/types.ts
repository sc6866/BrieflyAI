export interface BriefingReport {
  date: string;
  sections: {
    categoryLabel: string;
    items: NewsItem[];
  }[];
  trending: TrendingItem[];
  executiveSummary: string;
  mobileSummary: string;
  cacheTimestamp?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  impactScore: number;
  timestamp: string;
}

export interface TrendingItem {
  rank: number;
  topic: string;
  heat: string;
  platform: string;
  analysis: string;
  url: string;
  type: 'TOPIC' | 'PRODUCT';
}

export interface CategoryConfig {
  id: string;
  label: string;
  urls: string[];
}

export interface EmailConfig {
  emailRecipient: string;
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
}
