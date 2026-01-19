'use client';

import React from 'react';
import { BLOG_POSTS } from '@/constants';
import { FadeIn } from './ui/FadeIn';
import { BlogPost } from '@/constants';

interface BlogProps {
  onPostClick: (post: BlogPost) => void;
  onViewAllClick: () => void;
}

const Blog: React.FC<BlogProps> = ({ onPostClick, onViewAllClick }) => {
  return (
    <section id="blog" className="py-32 bg-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="mb-20 flex flex-col md:flex-row justify-between items-end">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Insights.</h2>
            <p className="text-xl text-gray-500 max-w-xl keep-all">
              변화하는 디지털 마케팅 트렌드와 SEO 전략에 대한 깊이 있는 분석.
            </p>
          </div>
          <button 
            onClick={onViewAllClick}
            className="hidden md:block text-brand-blue hover:text-white transition-colors mt-4 md:mt-0 font-medium"
          >
            전체 글 보기 →
          </button>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.slice(0, 3).map((post, index) => (
            <FadeIn key={post.id} delay={index * 150}>
              <article 
                onClick={() => onPostClick(post)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/3] bg-brand-dark border border-white/5">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-medium text-white">{post.category}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>Blink Ad Team</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-blue transition-colors keep-all leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed keep-all">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
            <button 
                onClick={onViewAllClick}
                className="text-brand-blue hover:text-white transition-colors font-medium"
            >
                전체 글 보기 →
            </button>
        </div>
      </div>
    </section>
  );
};

export default Blog;