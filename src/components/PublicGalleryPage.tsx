import React, { useState, useMemo, useEffect } from 'react';
import { GalleryItem } from '../types';
import { Search, ZoomIn, Download, Share2, Check, Send, Copy, X, ChevronLeft, ChevronRight, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUrl';
import { useFestival } from '../context/FestivalContext';

export const PublicGalleryPage: React.FC = () => {
  const { gallery: contextGallery = [] } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/gallery')
      .then(res => res.json())
      .then(data => {
        setGalleryItems(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch gallery:', err);
        setLoading(false);
      });
  }, []);

  // Combine fetched dataset with any custom items added in context
  const allGalleryItems = useMemo(() => {
    const combined = [...galleryItems];
    contextGallery.forEach((item) => {
      if (!combined.some((g) => g.id === item.id || g.imageUrl === item.imageUrl)) {
        combined.push(item);
      }
    });
    return combined;
  }, [contextGallery, galleryItems]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allGalleryItems.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return ['All', ...Array.from(cats)];
  }, [allGalleryItems]);

  // Filter gallery items by category & search query
  const filteredItems = useMemo(() => {
    return allGalleryItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.photographer && item.photographer.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesQuery;
    });
  }, [allGalleryItems, selectedCategory, searchQuery]);

  const handleNext = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setActiveItem(filteredItems[nextIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setActiveItem(filteredItems[prevIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-hd.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (_) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleShare = async (item: GalleryItem) => {
    const fullUrl = item.imageUrl.startsWith('http') ? item.imageUrl : window.location.origin + item.imageUrl;
    const text = `Check out this photo from Rendezvous Silver Edition: ${item.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: text,
          url: fullUrl
        });
        return;
      } catch (_) { }
    }

    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-20 sm:pt-24 pb-16 font-sans selection:bg-[#FF2B2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6 border-b border-[#2A2A30] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Festival Gallery
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              Complete photographic archive of Festival. Browse, download in HD, and share memories.
            </p>
          </div>

          <div className="bg-[#161619] border border-[#2D2D35] px-3.5 py-2 rounded-xl shrink-0 font-mono text-xs text-zinc-300">
            <span className="text-[#FF2B2B] font-bold">{filteredItems.length}</span> / {allGalleryItems.length} Photos
          </div>
        </div>

        {/* Filter Controls: Search & Category Filter Pills */}
          <div className="relative mb-6 sm:mb-8 max-w-2xl group z-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#FF2B2B] transition-colors" />
          <input
            type="text"
            placeholder="Search photos by title, category or photographer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FF2B2B]/50 focus:ring-1 focus:ring-[#FF2B2B]/50 transition-all font-sans text-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 scrollbar-hide shrink-0 z-10 relative mask-fade-edges">
          <div className="flex items-center gap-2 bg-[#18181B] border border-white/5 p-1 rounded-xl shrink-0">
            <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#FF2B2B] text-white shadow-lg shadow-red-900/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-8 h-8 text-[#FF2B2B] animate-spin mb-4" />
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Loading Gallery...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-[#18181B] rounded-2xl border border-white/5">
            <p className="text-zinc-400 font-mono text-sm mb-4">No photos match your filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-6 py-2 bg-[#FF2B2B] hover:bg-red-600 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-colors shadow-lg shadow-red-900/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
        /* Gallery Image Grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveItem(item);
                setCopied(false);
                setShowShareMenu(false);
              }}
              className="group relative bg-[#161619] border border-[#2A2A32] rounded-xl overflow-hidden cursor-pointer shadow-md sm:hover:border-[#FF2B2B] transition-colors duration-300 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black">
                <img
                  src={getMediaUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedFallback && item.imageUrl) {
                      target.dataset.triedFallback = 'true';
                      if (item.imageUrl.startsWith('/data/uploads/')) {
                        target.src = `https://rendevouz-8sfp.onrender.com/api${item.imageUrl}`;
                      } else if (!item.imageUrl.startsWith('http')) {
                        target.src = `https://rendevouz-8sfp.onrender.com${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}`;
                      }
                    }
                  }}
                />

                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 sm:group-hover:opacity-90 transition-opacity" />

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-zinc-300 uppercase border border-white/10">
                  {item.category}
                </div>

                {/* Zoom Icon Button */}
                <div className="absolute top-2 right-2 bg-[#FF2B2B] p-1 rounded-full text-white opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md">
                  <ZoomIn className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-2.5 bg-[#141417] border-t border-[#25252D] flex flex-col justify-between flex-1">
                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#FF2B2B] transition-colors">
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

      </div>

      {/* Lightbox Preview Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => {
              setActiveItem(null);
              setShowShareMenu(false);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-zinc-400 hover:text-white bg-white/10 rounded-full transition-colors z-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 text-zinc-300 hover:text-white bg-black/60 border border-white/10 hover:border-[#FF2B2B] rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 text-zinc-300 hover:text-white bg-black/60 border border-white/10 hover:border-[#FF2B2B] rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center space-y-3">
            {/* Image Box */}
            <div className="relative w-full max-h-[65vh] aspect-video bg-black rounded-xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center">
              <img
                src={getMediaUrl(activeItem.imageUrl)}
                alt={activeItem.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </div>

            {/* Caption Info */}
            <div className="text-center space-y-1 max-w-xl">
              <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
              {activeItem.caption && (
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeItem.caption}</p>
              )}
              <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-400 pt-0.5">
                {activeItem.category && <span className="text-[#FF2B2B] uppercase font-bold">{activeItem.category}</span>}
                {activeItem.photographer && <span>Photo: {activeItem.photographer}</span>}
                {activeItem.date && <span>{activeItem.date}</span>}
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDownload(activeItem.imageUrl, activeItem.title)}
                className="px-4 py-2 bg-black/60 hover:bg-[#FF2B2B] border border-white/20 hover:border-[#FF2B2B] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 flex items-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD HD</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(activeItem)}
                className="px-4 py-2 bg-black/60 hover:bg-[#FF2B2B] border border-white/20 hover:border-[#FF2B2B] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 flex items-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED!' : 'SHARE'}</span>
              </button>
            </div>

            {/* Share Options Drawer */}
            {showShareMenu && (
              <div className="p-3 bg-[#18181C] border border-[#2D2D35] rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this photo from Rendezvous Silver Edition: ${activeItem.title}\n${activeItem.imageUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366] text-white text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(activeItem.imageUrl)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-[#FF2B2B] text-white text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
