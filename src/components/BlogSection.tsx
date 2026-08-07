import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Tag, Calendar, User, BookOpen, Clock, Heart, 
  ArrowLeft, ArrowRight, Brain, Sparkles, Sun, Moon,
  MessageSquare, Share2, Bookmark
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../lib/data';
import { apiGetBlogs, apiInitializeBlogs, resolveImageUrl, apiSubscribeToBlogs } from '../lib/api';
import { Logo } from './Logo';

interface BlogSectionProps {
  onBackToMain?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onBackToMain }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummaryGenerated, setAiSummaryGenerated] = useState(false);

  // Sync theme with document root
  useEffect(() => {
    const isRootDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isRootDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('admin_blogs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse admin_blogs from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    const unsubscribe = apiSubscribeToBlogs((data) => {
      if (data && data.length > 0) {
        setBlogs(data);
        localStorage.setItem('admin_blogs', JSON.stringify(data));
      } else {
        setBlogs([]);
        localStorage.setItem('admin_blogs', JSON.stringify([]));
      }
    });

    return () => unsubscribe();
  }, []);

  const getAiSummary = (postId: string) => {
    switch (postId) {
      case 'post_1':
        return [
          'High-performance, type-safe development is crucial for mobile-first web loads on slower 3G networks in rural Nigeria.',
          'Eliminating runtime overhead and pre-bundling templates guarantees zero layout-shifting on low-end Android browsers.',
          'Enterprise structures gain continuous uptime and sub-12ms database latency via distributed edge computing.'
        ];
      case 'post_2':
        return [
          'Targeted ad pipelines should pivot from broad, expensive keywords to localized regional micro-hubs like Garki or Lekki.',
          'Integrating direct CTA links to instant WhatsApp chat prompts increases conversion rates by 4.8x - 6.2x.',
          'Automated AI-managed bidding algorithms shift budgets continuously to maximize active daytime engagement.'
        ];
      case 'post_3':
        return [
          'Automating regulatory name checking and parallel SCUML security scans shortens corporate registration times to 5 days.',
          'Cloud-native legal filing interfaces remove manual physical courier delays and avoid compliance bottlenecks.',
          'Standardizing KYC document validation checks through automated APIs guarantees 100% regulatory clearance confidence.'
        ];
      default:
        return [
          'Optimizing digital systems directly enhances operational velocity and eliminates waste in processing pathways.',
          'Integrating modern frameworks allows local businesses to compete globally with lightweight web payloads.',
          'Type-safe architectures and robust caching strategies safeguard business integrity against network interruptions.'
        ];
    }
  };

  const categories = ['all', 'Marketing', 'Business Growth', 'AI', 'Technology'];

  // Filter posts
  const filteredPosts = useMemo(() => {
    return blogs.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

  const getRelatedArticles = (post: BlogPost) => {
    return blogs.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative flex flex-col w-full`}>
      {/* Top Standalone Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToMain}>
            <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onBackToMain && (
            <button
              type="button"
              onClick={onBackToMain}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Back to Main Site"
            >
              <ArrowLeft size={15} className="text-orange-500" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
          >
            {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 space-y-12 py-10 animate-fade-in text-left">
        {readingPost ? (
          /* BLOG POST IMMERSIVE READ MODE */
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-10"
          >
            {/* Back button */}
            <button 
              onClick={() => {
                setReadingPost(null);
                setAiSummaryGenerated(false);
                setIsGeneratingSummary(false);
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              <span>Back to Insights Node</span>
            </button>

            {/* Featured Image */}
            <div className="h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
              <img src={readingPost.image} alt={readingPost.title} className="w-full h-full object-cover" />
            </div>

            {/* Article Meta */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-full border border-orange-500/20">
                  {readingPost.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{readingPost.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>By {readingPost.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>{readingPost.readTime}</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight uppercase text-slate-900 dark:text-white">
                {readingPost.title}
              </h1>
            </div>

            {/* Article Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-6 font-light">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed italic border-l-4 border-orange-500 pl-6 bg-slate-100 dark:bg-slate-900/50 py-4 rounded-r-2xl">
                {readingPost.description}
              </p>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />
              <div className="space-y-4">
                {readingPost.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <p>
                In corporate structures, having an agile website dashboard paired with high-performance ad bidding models acts as a secondary lung for revenue expansion. At DS Tech, our consultants specialize in crafting digital workflows that guarantee consistent outreach and regulatory safety.
              </p>
            </div>

            {/* Article Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-8 border-t border-slate-200 dark:border-slate-800">
              <Tag size={13} className="text-slate-400" />
              {readingPost.tags.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase rounded-xl tracking-widest hover:border-orange-500/50 transition-colors cursor-default">
                  #{t}
                </span>
              ))}
            </div>

            {/* Interactive AI Summary Block */}
            <div className="bg-gradient-to-br from-[#000E32] to-slate-950 text-white p-8 rounded-3xl border border-indigo-900 relative overflow-hidden shadow-2xl text-left">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-inner shadow-orange-500/5">
                    <Brain className="animate-pulse" size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 font-black block uppercase">// COGNITIVE SUMMARIZATION ENGINE</span>
                    <h3 className="text-base font-extrabold font-serif uppercase text-white tracking-tight">AI Executive Summary Assistant</h3>
                  </div>
                </div>

                {!aiSummaryGenerated && !isGeneratingSummary && (
                  <button
                    onClick={() => {
                      setIsGeneratingSummary(true);
                      setTimeout(() => {
                        setIsGeneratingSummary(false);
                        setAiSummaryGenerated(true);
                      }, 1500);
                    }}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 hover:scale-105"
                  >
                    <Sparkles size={14} />
                    <span>Generate Summary</span>
                  </button>
                )}
              </div>

              <div className="relative z-10 mt-6">
                {isGeneratingSummary && (
                  <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-orange-300 font-mono tracking-widest uppercase animate-pulse">Running semantic decomposition...</span>
                  </div>
                )}

                {aiSummaryGenerated && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 font-black block uppercase">Analysis Output:</span>
                    <ul className="space-y-3.5">
                      {getAiSummary(readingPost.id).map((point, idx) => (
                        <motion.li
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                          key={idx}
                          className="text-xs text-slate-200 flex items-start gap-3 leading-relaxed font-light"
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5 shadow-sm shadow-orange-500/50" />
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setAiSummaryGenerated(false)}
                      className="text-[9px] text-slate-500 hover:text-white underline font-mono tracking-widest uppercase block pt-4 transition-colors"
                    >
                      Clear Summary Cache
                    </button>
                  </div>
                )}

                {!aiSummaryGenerated && !isGeneratingSummary && (
                  <p className="text-slate-400 text-xs leading-relaxed font-light max-w-2xl">
                    Launch our server-side cognitive parser to instantly generate three compressed executive bullet takeaways for this guide. Perfect for rapid decision-making.
                  </p>
                )}
              </div>
            </div>

            {/* RELATED ARTICLES */}
            <div className="pt-16 space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black uppercase font-serif tracking-widest text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
                  Explore More Insights
                </h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {getRelatedArticles(readingPost).map(post => (
                  <motion.div 
                    key={post.id} 
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setReadingPost(post);
                      setAiSummaryGenerated(false);
                      setIsGeneratingSummary(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-md hover:shadow-xl transition-all p-5 cursor-pointer text-left space-y-4 group"
                  >
                    <div className="h-40 overflow-hidden rounded-2xl relative">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">{post.category}</span>
                      <h4 className="font-extrabold text-[#000E32] dark:text-white text-sm line-clamp-2 group-hover:text-orange-500 transition-colors uppercase font-serif tracking-tight leading-snug">{post.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.article>
        ) : (
          /* BLOG POST DIRECTORY LIST */
          <div className="space-y-12">
            {/* Page Header */}
            <div className="space-y-4">
              <span className="text-orange-500 text-xs uppercase tracking-widest font-black">AGENCY INTEL</span>
              <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Knowledge</span> Node
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
                Professional guides on high-conversion ad bidding, enterprise software architectures, and Nigerian corporate compliance strategies. Engineered for growth.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              {/* Search Input */}
              <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-2 flex items-center shadow-inner">
                <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, technical tags, or authors..." 
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1.5"
                />
              </div>

              {/* Pill Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                      selectedCategory === cat
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-lg shadow-orange-500/10'
                        : 'bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/60'
                    }`}
                  >
                    {cat === 'all' ? 'All Intel' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Grid */}
            {filteredPosts.length === 0 ? (
              <div className="py-24 text-center space-y-4 bg-white dark:bg-slate-900/35 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest">No articles indexed</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-light">Try adjusting your search filters or technical categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post, idx) => (
                    <motion.article 
                      key={post.id} 
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ 
                        y: -8, 
                        borderColor: 'rgba(249, 115, 22, 0.4)',
                      }}
                      onClick={() => {
                        setReadingPost(post);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-md hover:shadow-2xl transition-all group flex flex-col sm:flex-row cursor-pointer relative min-h-[220px]"
                    >
                      {/* Floating AI Categorization Overlay Badge */}
                      <div className="absolute top-4 left-4 bg-slate-950/90 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 z-10 backdrop-blur-md shadow-lg">
                        <Sparkles size={10} className="text-orange-400" />
                        <span>Verified Insight</span>
                      </div>

                      <div className="sm:w-2/5 h-56 sm:h-auto overflow-hidden relative shrink-0">
                        <img 
                          src={resolveImageUrl(post.image)} 
                          alt={post.title} 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop&q=60';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent sm:hidden" />
                      </div>

                      <div className="p-8 sm:w-3/5 text-left flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                            <span className="text-indigo-500 dark:text-indigo-400">
                              // {post.category}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                              <Clock size={12} />
                              {post.readTime}
                            </span>
                          </div>
                          
                          <h3 className="font-extrabold text-[#000E32] dark:text-white text-base md:text-lg line-clamp-2 leading-tight font-serif uppercase group-hover:text-orange-500 transition-colors tracking-tight">
                            {post.title}
                          </h3>
                          
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-light line-clamp-2 leading-relaxed">
                            {post.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <User size={12} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{post.author}</span>
                          </div>
                          <span className="text-[10px] font-black text-orange-500 group-hover:translate-x-2 transition-transform uppercase tracking-widest flex items-center gap-2">
                            <span>Read Guide</span>
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Newsletter / CTA Section */}
            <section className="mt-12 p-10 bg-indigo-950 text-white rounded-[3rem] border border-indigo-900 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-[100px] pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <span className="text-orange-400 text-xs uppercase tracking-widest font-black">STAY SYNCED</span>
                  <h2 className="text-3xl font-extrabold uppercase font-serif tracking-tight leading-tight">
                    Get Technical Insights <br />
                    <span className="text-orange-400 font-extrabold italic">Direct to Inbox</span>
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed font-light max-w-md">
                    Join 2,400+ Nigerian CEOs, enterprise founders, and innovators receiving our bi-weekly breakdown of ad-bidding optimizations and corporate compliance alerts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter professional email" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
                    Subscribe
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
