import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

interface BlogPostDetailProps {
  post: BlogPost;
  onBack: () => void;
  onNavigate: (target: string) => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post, onBack, onNavigate }) => {
  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="min-h-screen bg-black text-gray-200 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation */}
        <FadeIn>
          <button 
            onClick={onBack}
            className="group flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">목록으로 돌아가기</span>
          </button>
        </FadeIn>

        {/* Header Section */}
        <FadeIn delay={100}>
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold tracking-wide uppercase mb-4 border border-brand-blue/20">
              <Tag className="w-3 h-3 mr-1" />
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 keep-all">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-white/10 pb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Blink Ad Editorial Team</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Featured Image */}
        <FadeIn delay={200}>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 bg-brand-dark border border-white/10">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </FadeIn>

        {/* Content Body */}
        <FadeIn delay={300}>
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-300 prose-a:text-brand-blue hover:prose-a:text-blue-400 prose-strong:text-white prose-ul:text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </FadeIn>

        {/* Footer of Article */}
        <FadeIn delay={400}>
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-white mb-4">전문적인 SEO 컨설팅이 필요하신가요?</h3>
            <p className="text-gray-400 mb-8 max-w-lg">
              블링크애드의 전문가들이 귀하의 비즈니스에 최적화된 전략을 제안해드립니다.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-brand-blue text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              무료 진단 신청하기
            </button>
          </div>
        </FadeIn>
      </div>
    </article>
  );
};

export default BlogPostDetail;