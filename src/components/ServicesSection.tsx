import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MessageSquare, ArrowUpRight, ArrowRight, Sparkles, 
  Layers, Database, Laptop, Bot, LineChart, Cpu, Fingerprint, HelpCircle
} from 'lucide-react';
import { SERVICES, ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { ServiceDetailView } from './ServiceDetailView';
import { ServiceCard } from './ServiceCard';
import { apiGetServices, apiInitializeServices } from '../lib/api';

interface ServicesSectionProps {
  language: LanguageCode;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  language, 
  selectedId, 
  onSelectId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(8);

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('admin_services');
      return saved ? JSON.parse(saved) : SERVICES;
    } catch (e) {
      console.error('Failed to parse admin_services from localStorage:', e);
      return SERVICES;
    }
  });

  useEffect(() => {
    const fetchD1Services = async () => {
      try {
        const data = await apiGetServices();
        if (data && data.length > 0) {
          setServices(data);
          localStorage.setItem('admin_services', JSON.stringify(data));
        } else {
          // Empty D1 database - auto-seed D1 with standard SERVICES catalog!
          await apiInitializeServices(SERVICES);
          setServices(SERVICES);
          localStorage.setItem('admin_services', JSON.stringify(SERVICES));
        }
      } catch (err) {
        console.warn('D1 database unreachable. Falling back to LocalStorage.', err);
      }
    };

    fetchD1Services();

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('admin_services');
        if (saved) {
          setServices(JSON.parse(saved));
        } else {
          setServices(SERVICES);
        }
      } catch (e) {
        console.error('Failed to parse admin_services in storage event:', e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Scroll to the absolute top when selectedId changes
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTo({ top: 0, behavior: 'auto' });
      const mainContainer = document.querySelector('main') || document.getElementById('root');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  }, [selectedId]);

  // Dynamic category translation
  const categories = useMemo(() => {
    const labels: Record<LanguageCode, Record<string, string>> = {
      en: {
        all: 'All Services',
        marketing: 'Digital Marketing',
        web: 'Web Development',
        software: 'Software Development',
        ai: 'AI Solutions',
        business: 'Business Services',
        branding: 'Branding',
        ict: 'ICT Solutions',
        training: 'Training',
        compliance: 'Compliance'
      },
      zh: {
        all: '全部服务',
        marketing: '数字营销',
        web: '网站开发',
        software: '软件开发',
        ai: 'AI 解决方案',
        business: '商务服务',
        branding: '品牌设计',
        ict: 'ICT 解决方案',
        training: '专业培训',
        compliance: '合规登记'
      },
      fr: {
        all: 'Tous les Services',
        marketing: 'Marketing Digital',
        web: 'Développement Web',
        software: 'Développement Logiciel',
        ai: 'Solutions IA',
        business: 'Services Commerciaux',
        branding: 'Identité de Marque',
        ict: 'Solutions TIC',
        training: 'Formations',
        compliance: 'Conformité'
      },
      ha: {
        all: 'Duk Ayyuka',
        marketing: 'Tallan Dijital',
        web: 'Ci gaban Yanar Gizo',
        software: 'Injinan Software',
        ai: 'Hanyoyin AI',
        business: 'Ayyukan Kasuwanci',
        branding: 'Kayan Suna',
        ict: 'Ayyukan ICT',
        training: 'Horo da Kwarewa',
        compliance: 'Kiyaye Dokoki'
      },
      yo: {
        all: 'Gbogbo Iṣẹ',
        marketing: 'Titaja Oni-nọmba',
        web: 'Idagbasoke Wẹẹbu',
        software: 'Idagbasoke Sọfitiwia',
        ai: 'Awọn Ojutu AI',
        business: 'Awọn Iṣẹ Iṣowo',
        branding: 'Iyasọtọ Ami',
        ict: 'Awọn Ojutu ICT',
        training: 'Ikẹkọọ Kọmputa',
        compliance: 'Ibamu Ofin'
      },
      es: {
        all: 'Todos los Servicios',
        marketing: 'Marketing Digital',
        web: 'Desarrollo Web',
        software: 'Desarrollo de Software',
        ai: 'Soluciones de IA',
        business: 'Servicios de Negocios',
        branding: 'Branding de Marca',
        ict: 'Soluciones TIC',
        training: 'Capacitación',
        compliance: 'Cumplimiento Legal'
      },
      de: {
        all: 'Alle Dienstleistungen',
        marketing: 'Digitales Marketing',
        web: 'Webentwicklung',
        software: 'Softwareentwicklung',
        ai: 'KI-Lösungen',
        business: 'Geschäftsservices',
        branding: 'Branding & Design',
        ict: 'IT-Infrastruktur',
        training: 'Weiterbildung',
        compliance: 'Rechtliche Compliance'
      },
      ru: {
        all: 'Все услуги',
        marketing: 'Цифровой маркетинг',
        web: 'Веб-разработка',
        software: 'Разработка ПО',
        ai: 'Решения ИИ',
        business: 'Бизнес-услуги',
        branding: 'Брендинг',
        ict: 'Решения ИКТ',
        training: 'Обучение',
        compliance: 'Юридический комплаенс'
      },
      pt: {
        all: 'Todos os Serviços',
        marketing: 'Marketing Digital',
        web: 'Desenvolvimento Web',
        software: 'Desenvolvimento de Software',
        ai: 'Soluções em IA',
        business: 'Serviços de Negócios',
        branding: 'Identidade Visual',
        ict: 'Soluções TIC',
        training: 'Treinamento',
        compliance: 'Conformidade Legal'
      },
      ar: {
        all: 'جميع الخدمات',
        marketing: 'التسويق الرقمي',
        web: 'تطوير المواقع',
        software: 'تطوير البرمجيات',
        ai: 'حلول الذكاء الاصطناعي',
        business: 'خدمات الأعمال',
        branding: 'الهوية البصرية',
        ict: 'حلول الاتصالات',
        training: 'الدورات التدريبية',
        compliance: 'الامتثال القانوني'
      }
    };

    const activeDict = labels[language] || labels.en;
    return [
      { id: 'all', label: activeDict.all },
      { id: 'marketing', label: activeDict.marketing },
      { id: 'web', label: activeDict.web },
      { id: 'software', label: activeDict.software },
      { id: 'ai', label: activeDict.ai },
      { id: 'business', label: activeDict.business },
      { id: 'branding', label: activeDict.branding },
      { id: 'ict', label: activeDict.ict },
      { id: 'training', label: activeDict.training },
      { id: 'compliance', label: activeDict.compliance }
    ];
  }, [language]);

  // Helper to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      case 'web': return <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case 'software': return <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />;
      case 'ai': return <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
      case 'business': return <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />;
      case 'branding': return <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />;
      case 'ict': return <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />;
      case 'training': return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />;
      case 'compliance': return <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />;
      default: return <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />;
    }
  };

  // Safe image fallbacks
  const getServiceImage = (svc: ServiceItem) => {
    if (svc.image && svc.image.trim() !== '') {
      return svc.image;
    }
    const fallbackImages: Record<string, string> = {
      marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      web: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&80",
      software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      ai: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      business: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
      branding: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80",
      ict: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80",
      training: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
      compliance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80"
    };
    return fallbackImages[svc.category] || fallbackImages.business;
  };

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            svc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || svc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach(svc => {
      counts[svc.category] = (counts[svc.category] || 0) + 1;
    });
    return counts;
  }, [services]);

  const displayedServices = useMemo(() => {
    return filteredServices.slice(0, visibleCount);
  }, [filteredServices, visibleCount]);

  const getBentoSpan = (index: number) => {
    if (index === 0 || index === 4 || index === 7 || index === 13 || index === 19 || index === 21) {
      return 'md:col-span-2 lg:col-span-2';
    }
    return 'md:col-span-1 lg:col-span-1';
  };

  // If a specific service details view is selected
  const selectedSvcObj = useMemo(() => {
    if (!selectedId) return null;
    return services.find(s => s.id === selectedId) || null;
  }, [services, selectedId]);

  if (selectedSvcObj) {
    return (
      <ServiceDetailView 
        service={selectedSvcObj}
        language={language}
        onBack={() => onSelectId(null)}
      />
    );
  }

  // Translation helpers for local labels
  const uiText = {
    en: {
      titlePrefix: 'Our Services',
      titleSuffix: 'Directory',
      desc: 'Explore our modern, comprehensive, and legal-authorized catalog. Map prices and book directly with our consultant managers via WhatsApp.',
      searchPlaceholder: 'Search all 26 professional services...',
      statusActive: 'solutions active',
      noFound: 'No matching services found',
      noFoundDesc: 'Try adjusting your filters or search keywords.',
      loadMore: 'Load More Services'
    },
    zh: {
      titlePrefix: '专业解决方案',
      titleSuffix: '名录',
      desc: '探索我们现代、全面且合规授权的专业服务名录。查看专属报价，并通过 WhatsApp 与我们的项目经理即时建联。',
      searchPlaceholder: '搜索 26 项专业顾问服务及技术栈...',
      statusActive: '项解决方案活跃中',
      noFound: '未找到匹配的方案',
      noFoundDesc: '试着调整一下筛选类别或搜索关键词吧！',
      loadMore: '加载更多专业服务'
    },
    fr: {
      titlePrefix: 'Notre Annuaire de',
      titleSuffix: 'Services',
      desc: 'Explorez notre catalogue moderne, complet et légalement autorisé. Comparez les prix et réservez directement avec nos conseillers via WhatsApp.',
      searchPlaceholder: 'Rechercher parmi les 26 services professionnels...',
      statusActive: 'solutions actives',
      noFound: 'Aucun service correspondant trouvé',
      noFoundDesc: 'Essayez d\'ajuster vos filtres ou vos mots-clés de recherche.',
      loadMore: 'Charger plus de services'
    },
    ha: {
      titlePrefix: 'Ayyukanmu',
      titleSuffix: 'Littafi',
      desc: 'Bincika littafinmu na zamani, cikakke, kuma halal a ƙarƙashin doka. Yi lissafin farashi kuma yi littafi kai tsaye tare da manajojin mu ta WhatsApp.',
      searchPlaceholder: 'Bincika dukkan ayyukan ƙwararru guda 26...',
      statusActive: 'ayyuka suna aiki',
      noFound: 'Ba a sami ayyukan da suka dace ba',
      noFoundDesc: 'Gwada daidaita tacewa ko kalmomin bincike naku.',
      loadMore: 'Sanya Karin Ayyuka'
    },
    yo: {
      titlePrefix: 'Awọn Iṣẹ Wa',
      titleSuffix: 'Ìwé-Àkọsílẹ̀',
      desc: 'Ṣawari iwe-akọsilẹ ode-oni, ti o gbooro, ati ti o ni ibamu ofin. Wo awọn idiyele ati ṣe iwe adehun pẹlu awọn alakoso wa nipasẹ WhatsApp.',
      searchPlaceholder: 'Ṣawari gbogbo awọn iṣẹ amọdaju 26...',
      statusActive: 'awọn ojutu lọwọ lọwọ',
      noFound: 'Ko si iṣẹ ti o baamu ti a rii',
      noFoundDesc: 'Gbiyanju lati ṣatunṣe awọn asẹ rẹ tabi awọn ọrọ bincike.',
      loadMore: 'Gba Diẹ Ninu Awọn Iṣẹ'
    }
  };

  const currentUi = uiText[language] || uiText.en;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      {/* Page Header */}
      <div className="space-y-4">
        <span className="text-orange-500 text-xs uppercase tracking-widest font-black">ELITE CATALOG</span>
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
          {currentUi.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">{currentUi.titleSuffix}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
          {currentUi.desc}
        </p>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="space-y-6">
        
        {/* Interactive Search input & Statistics bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
          <div className="relative w-full md:max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-1.5 flex items-center shadow-inner">
            <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(8); // reset pagination
              }}
              placeholder={currentUi.searchPlaceholder} 
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1.5"
            />
          </div>
          
          <div className="flex items-center gap-2 px-1 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{filteredServices.length} {language === 'zh' ? currentUi.statusActive : `of ${services.length} ${currentUi.statusActive}`}</span>
          </div>
        </div>

        {/* Elegant Bento Category Selector Grid - Restructured for supreme usability */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setVisibleCount(8); // reset pagination
                }}
                className={`p-3.5 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-24 border ${
                  isActive
                    ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-lg shadow-orange-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-850 hover:border-orange-500/30'
                }`}
                type="button"
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800'}`}>
                    {cat.id === 'all' ? <Layers className="w-4 h-4 text-orange-500" /> : getCategoryIcon(cat.id)}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-850 text-slate-500'}`}>
                    {count}
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold uppercase tracking-tight line-clamp-1 leading-none ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Fade Track Mobile Scroller */}
        <div className="relative w-full block sm:hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent pointer-events-none z-10" />
          <div className="flex overflow-x-auto scrollbar-none gap-2 py-1 px-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={`scroll-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setVisibleCount(8);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 text-slate-600 dark:text-slate-300'
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SERVICES BENTO GRID */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <HelpCircle size={36} className="mx-auto text-slate-400 animate-bounce" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{currentUi.noFound}</p>
          <p className="text-slate-400 dark:text-slate-500 text-[11px]">{currentUi.noFoundDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedServices.map((svc, index) => {
              const bentoSpan = getBentoSpan(index);
              return (
                <ServiceCard 
                  key={svc.id}
                  svc={svc}
                  index={index}
                  language={language}
                  onSelect={onSelectId}
                  bentoSpan={bentoSpan}
                  getCategoryIcon={getCategoryIcon}
                  getServiceImage={getServiceImage}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* LOAD MORE BUTTON */}
      {filteredServices.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-2"
          >
            <span>{currentUi.loadMore}</span>
            <Layers size={13} />
          </motion.button>
        </div>
      )}
    </div>
  );
};
