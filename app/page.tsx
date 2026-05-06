import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import CaseStudies from '@/components/CaseStudies'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <Services />
        <CaseStudies />

        {/* Blog Preview Section */}
        <section id="blog" className="py-32 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Insights.</h2>
            <p className="text-xl text-gray-400 mb-12 keep-all">
              검색 엔진 최적화(SEO)부터 디지털 브랜딩 전략까지.
            </p>
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 text-lg font-medium transition-colors group"
            >
              블로그 보기
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  )
}
