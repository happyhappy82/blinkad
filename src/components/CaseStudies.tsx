import React from 'react';
import { CASE_STUDIES, CHART_DATA } from '../constants';
import { FadeIn } from './ui/FadeIn';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const CaseStudies: React.FC = () => {
  return (
    <section id="casestudies" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Proven Results.</h2>
            <p className="text-xl text-gray-500 max-w-xl keep-all">
              단순한 순위 상승을 약속하지 않습니다. 측정 가능한 비즈니스 성장을 증명합니다.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-brand-blue text-lg font-medium">100+ 고객사 성장 견인</p>
          </div>
        </FadeIn>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(300px,auto)]">
          
          {/* Main Chart Card (Takes up 2x2 on Desktop) */}
          <FadeIn className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-brand-dark border border-white/5 p-8 flex flex-col">
             <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">{CASE_STUDIES[0].client}</h3>
                    <p className="text-gray-400 keep-all">{CASE_STUDIES[0].description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-brand-blue">{CASE_STUDIES[0].value}</div>
                    <div className="text-sm text-gray-500">{CASE_STUDIES[0].metric}</div>
                  </div>
                </div>

                <div className="h-64 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1D1D1F', borderColor: '#333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="traffic" 
                        stroke="#0071E3" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTraffic)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </FadeIn>

          {/* Secondary Stats Card */}
          <FadeIn delay={200} className="md:col-span-2 md:row-span-1 rounded-3xl bg-brand-dark border border-white/5 p-8 flex flex-col justify-center group hover:border-white/20 transition-colors">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{CASE_STUDIES[1].client}</h3>
                  <p className="text-gray-400 text-sm keep-all">{CASE_STUDIES[1].description}</p>
                </div>
                <div className="text-right">
                   <div className="text-5xl font-bold text-white tracking-tight">{CASE_STUDIES[1].value}</div>
                   <div className="text-sm text-brand-blue font-medium mt-1">{CASE_STUDIES[1].metric}</div>
                </div>
             </div>
          </FadeIn>

          {/* Third Card */}
           <FadeIn delay={400} className="md:col-span-2 md:row-span-1 rounded-3xl bg-brand-dark border border-white/5 p-8 flex flex-col justify-center group hover:border-white/20 transition-colors">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{CASE_STUDIES[2].client}</h3>
                  <p className="text-gray-400 text-sm keep-all">{CASE_STUDIES[2].description}</p>
                </div>
                <div className="text-right">
                   <div className="text-5xl font-bold text-white tracking-tight">{CASE_STUDIES[2].value}</div>
                   <div className="text-sm text-brand-blue font-medium mt-1">{CASE_STUDIES[2].metric}</div>
                </div>
             </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default CaseStudies;