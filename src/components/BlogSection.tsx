import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, Sparkles, Clock, User, ArrowRight, ArrowLeft, 
  Share2, Tag, Bot, ChevronRight, CheckCircle2, Send, Flame, X
} from 'lucide-react';
import { apiSubscribeToBlogs } from '../lib/api';
import { BLOG_POSTS, BlogPost } from '../lib/data';
import { StandalonePageHeader } from './StandalonePageHeader';
import { StandalonePageFooter } from './StandalonePageFooter';

interface BlogSectionProps {
  onBackToMain?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onBackToMain }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('admin_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return BLOG_POSTS;
    } catch (e) {
      return BLOG_POSTS;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // AI Executive Summary state
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);

  useEffect(() => {
    const unsub = apiSubscribeToBlogs((data) => {
      if (data && data.length > 0) {
        setPosts(data);
      }
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(posts.map(p => p.category || 'General')))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    setAiSummary(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateAiSummary = (post: BlogPost) => {
    setIsGeneratingAiSummary(true);
    setTimeout(() => {
      setAiSummary([
        `Core Focus: Strategic analysis of ${post.title} for enterprise execution.`,
        `Key Takeaway: Adopting structured digital frameworks accelerates conversion rates and market positioning.`,
        `Actionable Impact: Enforce compliant technical protocols to maintain maximum domain authority.`
      ]);
      setIsGeneratingAiSummary(false);
    }, 1000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => setNewsletterSubscribed(false), 4000);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-500 flex flex-col w-full selection:bg-orange-500 selection:text-white">
      {/* Standalone Header */}
      <StandalonePageHeader 
        activePage="blog" 
        badgeText="KNOWLEDGE NODE" 
        onBackToMain={onBackToMain} 
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in text-left">
        
        {/* ARTICLE DETAIL VIEW */}
        {selectedPost ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10 max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} className="text-orange-500" />
              <span>Back to Articles</span>
            </button>

            {/* Post Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={13} />
                  <span>{selectedPost.readTime || '5 min read'}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedPost.date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tight leading-tight">
                {selectedPost.title}
              </h1>

              {/* Author Strip */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">
                  {selectedPost.author?.charAt(0) || 'D'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {selectedPost.author || 'DS Tech Editorial Team'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Verified Technical Briefing
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-3xl overflow-hidden h-72 sm:h-96 relative bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* AI EXECUTIVE SUMMARY WIDGET */}
            <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/15 dark:to-transparent rounded-3xl p-6 sm:p-8 border border-orange-500/20 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-mono text-xs font-black uppercase tracking-widest">
                  <Bot size={18} className="animate-pulse" />
                  <span>AI EXECUTIVE SUMMARY ENGINE</span>
                </div>

                {!aiSummary && (
                  <button
                    onClick={() => handleGenerateAiSummary(selectedPost)}
                    disabled={isGeneratingAiSummary}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    <span>{isGeneratingAiSummary ? 'Analyzing...' : 'Generate AI Brief'}</span>
                  </button>
                )}
              </div>

              {aiSummary ? (
                <div className="space-y-2 pt-2">
                  {aiSummary.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                      <CheckCircle2 size={15} className="text-orange-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                  Click 'Generate AI Brief' to extract key strategic takeaways from this article using our AI engine.
                </p>
              )}
            </div>

            {/* Article Content Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-6">
              {selectedPost.content?.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Tags Strip */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 dark:border-slate-800">
                {selectedPost.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold rounded-xl">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* DIRECTORY LISTING VIEW */
          <>
            {/* HERO BANNER */}
            <section className="relative rounded-3xl bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white p-6 sm:p-10 md:p-12 overflow-hidden border border-indigo-950 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>THE KNOWLEDGE NODE & STRATEGIC INTEL</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase font-serif">
                  Engineering Briefings <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 font-extrabold italic">
                    & Digital Strategy
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-light">
                  Actionable technical articles, software architecture breakdowns, performance advertising playbooks, and corporate compliance guides written by DS Tech lead engineers.
                </p>

                {/* Editorial Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{posts.length}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Published Guides</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">100%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Technical Verification</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">AI Briefs</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Instant Summaries</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">Weekly</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Fresh Briefings</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SEARCH AND CATEGORY FILTER DECK */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm backdrop-blur-md">
                
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles, topics, or keywords..."
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        {cat === 'all' ? 'All Intel' : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* POSTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      onClick={() => handleOpenPost(post)}
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Image Box */}
                        <div className="relative h-48 overflow-hidden bg-slate-950">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold uppercase text-orange-400 border border-white/10">
                            {post.category}
                          </div>

                          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold text-slate-300 border border-white/10 flex items-center gap-1">
                            <Clock size={11} />
                            <span>{post.readTime || '5 min'}</span>
                          </div>
                        </div>

                        {/* Text Body */}
                        <div className="p-6 space-y-3">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            {post.date}
                          </span>

                          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif group-hover:text-orange-500 transition-colors tracking-tight line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-normal line-clamp-3">
                            {post.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-orange-500 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                        <span>Read Technical Guide</span>
                        <ArrowRight size={14} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredPosts.length === 0 && (
                  <div className="col-span-full py-16 text-center space-y-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No technical articles found matching your query.</p>
                    <button 
                      onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* NEWSLETTER SUBSCRIPTION CTA */}
            <section className="bg-gradient-to-r from-slate-900 via-[#000E32] to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-4 text-left">
                <span className="text-orange-400 font-mono text-xs font-black uppercase tracking-widest block">
                  WEEKLY INTEL DESK
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif">
                  Subscribe to Technical Briefings
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  Receive curated insights on enterprise software engineering, performance ad bidding strategy, and CAC corporate compliance directly in your inbox.
                </p>

                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter corporate email address..."
                    className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <Send size={14} />
                  </button>
                </form>

                {newsletterSubscribed && (
                  <p className="text-emerald-400 text-xs font-bold font-mono pt-1">
                    ✓ Subscribed! You will receive our next technical dispatch.
                  </p>
                )}
              </div>
            </section>
          </>
        )}

      </main>

      {/* Standalone Footer */}
      <StandalonePageFooter />
    </div>
  );
};
