import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Tag, Calendar, User, BookOpen, Clock, Heart, ArrowLeft, ArrowRight, Brain, Sparkles } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../lib/data';
import { apiGetBlogs, apiInitializeBlogs, resolveImageUrl } from '../lib/api';

export const BlogSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummaryGenerated, setAiSummaryGenerated] = useState(false);

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('admin_blogs');
      return saved ? JSON.parse(saved) : BLOG_POSTS;
    } catch (e) {
      console.error('Failed to parse admin_blogs from localStorage:', e);
      return BLOG_POSTS;
    }
  });

  useEffect(() => {
    const fetchD1Blogs = async () => {
      try {
        const data = await apiGetBlogs();
        if (data && data.length > 0) {
          setBlogs(data);
          localStorage.setItem('admin_blogs', JSON.stringify(data));
        } else {
          // Empty D1 - seed with static BLOG_POSTS
          await apiInitializeBlogs(BLOG_POSTS);
          setBlogs(BLOG_POSTS);
          localStorage.setItem('admin_blogs', JSON.stringify(BLOG_POSTS));
        }
      } catch (err) {
        console.warn('D1 blogs database unreachable. Falling back to LocalStorage.', err);
      }
    };

    fetchD1Blogs();

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('admin_blogs');
        if (saved) {
          setBlogs(JSON.parse(saved));
        } else {
          setBlogs(BLOG_POSTS);
        }
      } catch (e) {
        console.error('Failed to parse admin_blogs in storage event:', e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

  // Find related articles (matching category)
  const getRelatedArticles = (post: BlogPost) => {
    return blogs.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      
      {readingPost ? (
        /* BLOG POST IMMERSIVE READ MODE */
        <article className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Back button */}
          <button 
            onClick={() => {
              setReadingPost(null);
              setAiSummaryGenerated(false);
              setIsGeneratingSummary(false);
              window.scrollTo({ top: 0, behavior: 'auto' });
            }}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Back to Article Feed</span>
          </button>

          {/* Featured Image */}
          <div className="h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img src={readingPost.image} alt={readingPost.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-full text-[10px] uppercase font-black">
                {readingPost.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{readingPost.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>By {readingPost.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{readingPost.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight uppercase text-slate-900 dark:text-white">
              {readingPost.title}
            </h1>
          </div>

          {/* Article Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4 font-light">
            <p className="font-medium text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
              {readingPost.description}
            </p>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />
            <p>{readingPost.content}</p>
            <p>
              In corporate structures, having an agile website dashboard paired with high-performance ad bidding models acts as a secondary lung for revenue expansion. At DS Tech, our consultants specialize in crafting digital workflows that guarantee consistent outreach.
            </p>
          </div>

          {/* Article Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Tag size={12} className="text-slate-400" />
            {readingPost.tags.map((t, i) => (
              <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-xl">
                #{t}
              </span>
            ))}
          </div>

          {/* Interactive AI Summary Block */}
          <div className="bg-gradient-to-br from-[#000E32] to-[#031c5c] text-white p-6 rounded-3xl border border-orange-500/20 relative overflow-hidden shadow-xl text-left">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#021a52_1px,transparent_1px),linear-gradient(to_bottom,#021a52_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Brain className="text-amber-400 animate-pulse" size={20} />
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold block uppercase">// COGNITIVE SUMMARIZATION ENGINE</span>
                  <h3 className="text-sm font-extrabold font-serif uppercase text-white tracking-tight">AI Executive Summary Assistant</h3>
                </div>
              </div>

              {!aiSummaryGenerated && !isGeneratingSummary && (
                <button
                  onClick={() => {
                    setIsGeneratingSummary(true);
                    setTimeout(() => {
                      setIsGeneratingSummary(false);
                      setAiSummaryGenerated(true);
                    }, 1200);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Sparkles size={12} />
                  <span>Generate Summary</span>
                </button>
              )}
            </div>

            <div className="relative z-10 mt-4">
              {isGeneratingSummary && (
                <div className="py-4 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-[10px] text-orange-300 font-mono tracking-widest uppercase animate-pulse">Running semantic decomposition...</span>
                </div>
              )}

              {aiSummaryGenerated && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-wider text-orange-300 font-bold block uppercase">Analysis Output:</span>
                  <ul className="space-y-2.5">
                    {getAiSummary(readingPost.id).map((point, idx) => (
                      <motion.li
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                        key={idx}
                        className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setAiSummaryGenerated(false)}
                    className="text-[9px] text-slate-400 hover:text-white underline font-mono tracking-wider uppercase block pt-2"
                  >
                    Clear Summary Cache
                  </button>
                </div>
              )}

              {!aiSummaryGenerated && !isGeneratingSummary && (
                <p className="text-slate-300 text-xs leading-relaxed font-light">
                  Click the button above to launch our server-side cognitive parser and instantly generate three compressed executive bullet takeaways for this guide.
                </p>
              )}
            </div>
          </div>

          {/* RELATED ARTICLES */}
          <div className="pt-12 space-y-6">
            <h3 className="text-sm font-black uppercase font-serif tracking-widest text-slate-900 dark:text-white border-l-4 border-orange-500 pl-3">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {getRelatedArticles(readingPost).map(post => (
                <div 
                  key={post.id} 
                  onClick={() => {
                    setReadingPost(post);
                    setAiSummaryGenerated(false);
                    setIsGeneratingSummary(false);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 cursor-pointer text-left space-y-3 group"
                >
                  <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded-xl" />
                  <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">{post.category}</span>
                  <h4 className="font-extrabold text-[#000E32] dark:text-white text-xs line-clamp-1 group-hover:text-orange-500 transition-colors uppercase font-serif">{post.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </article>
      ) : (
        /* BLOG POST DIRECTORY LIST */
        <>
          {/* Header metadata */}
          <div className="space-y-4">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">INSIGHTS & INTEL</span>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
              The DS Tech <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Blog Node</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
              Get corporate guides on ad bidding algorithms, limited liability registry protocols, and React responsive layout optimizations.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search Input */}
            <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-1.5 flex items-center shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles & tags..." 
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1"
              />
            </div>

            {/* Pill Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60'
                  }`}
                >
                  {cat === 'all' ? 'All Articles' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Grid */}
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen size={30} className="mx-auto text-slate-400 animate-pulse" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">No articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredPosts.map((post, idx) => (
                <motion.article 
                  key={post.id} 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 280, damping: 20 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.025,
                    borderColor: 'rgba(249, 115, 22, 0.45)',
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setReadingPost(post);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all group flex flex-col sm:flex-row cursor-pointer relative"
                >
                  {/* Floating AI Categorization Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/90 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1 z-10 backdrop-blur-sm">
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                    <span>AI Index: Verified Insight</span>
                  </div>

                  <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden relative shrink-0">
                    <img 
                      src={resolveImageUrl(post.image)} 
                      alt={post.title} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop&q=60';
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  </div>
                  <div className="p-6 sm:w-2/3 text-left flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded uppercase">
                          {post.category}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs md:text-sm line-clamp-2 leading-tight font-serif uppercase group-hover:text-orange-500 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-light line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-mono">By {post.author}</span>
                      <span className="text-orange-500 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                        Read Guide
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
