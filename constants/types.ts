import type { ComponentType, SVGProps } from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
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
