import type { ComponentType, SVGProps } from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface CaseStudyScreenshot {
  label: string;
  value: string;
  src: string;
}

export interface CaseStudyInsight {
  title: string;
  detail: string;
}

export interface CaseStudyKeyword {
  keyword: string;
  volume: string;
  note?: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  industry: string;
  metric: string;
  value: string;
  description: string;
  imageUrl: string;
  beforeValue: string;
  afterValue: string;
  testimonial: string;
  customerName: string;
  customerRole: string;
  duration: string;
  keyResults: string[];
  screenshots?: CaseStudyScreenshot[];
  period?: string;
  background?: string;
  approach?: string[];
  insights?: CaseStudyInsight[];
  searchKeywords?: CaseStudyKeyword[];
  dataSource?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
  content: string;
}

export interface ChartDataPoint {
  month: string;
  traffic: number;
}
