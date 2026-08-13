import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { ZoomIn, ArrowRight, X, ChevronLeft, ChevronRight, Download, Share2, Check, Send, Copy, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUrl';

interface GallerySectionProps {
  onNavigate?: (sectionId: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/gallery?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        const featuredItems = items.filter((item: GalleryItem) => item.isFeatured);
        const displayList = featuredItems.length > 0 ? featuredItems.slice(0, 8) : items.slice(0, 8);
        setGalleryItems(displayList);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch gallery:', err);
        setLoading(false);
      });
  }, []);

  const displayItems = galleryItems;

  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeItem]);

  const handleNext = () => {
    if (!activeItem) return;
    const currentIndex = displayItems.findIndex(i => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % displayItems.length;
    setActiveItem(displayItems[nextIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currentIndex = displayItems.findIndex(i => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + displayItems.length) % displayItems.length;
    setActiveItem(displayItems[prevIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const mediaUrl = getMediaUrl(imageUrl);
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (_) {
      const a = document.createElement('a');
      a.href = getMediaUrl(imageUrl);
      a.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = (item: GalleryItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this photo from Rendezvous Silver Edition: ${item.title}`,
        url: window.location.origin + item.imageUrl,
      }).catch(() => setShowShareMenu(!showShareMenu));
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = (imageUrl: string) => {
    const fullUrl = window.location.origin + imageUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="gallery" className="py-10 sm:py-14 bg-[#0A0A0C] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-white/10 pb-5 gap-4">
          <div>
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
              MOMENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Festival Gallery
            </h2>
            <p className="text-zinc-400 text-xs font-sans mt-0.5">
              High-resolution snapshots from various events.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('gallery')}
            style={{ color: 'var(--color-primary-accent)' }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer self-start sm:self-auto"
          >
            <span>View All Photos ({galleryItems.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[4/3] bg-[#161619] border border-[#2A2A32] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 bg-[#161619]/50 rounded-2xl border border-white/5">
            <p className="text-zinc-400 font-medium">No featured photos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {displayItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveItem(item);
                  setCopied(false);
                  setShowShareMenu(false);
                }}
                className="group relative bg-[#161619] border border-[#2A2A32] rounded-xl overflow-hidden cursor-pointer shadow-md sm:hover:border-white/40 transition-colors duration-300 flex flex-col"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={getMediaUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                  />

                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 sm:group-hover:opacity-90 transition-opacity" />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-zinc-300 uppercase border border-white/10">
                    {item.category}
                  </div>

                  {/* Zoom Icon Button */}
                  <div className="absolute top-2 right-2 p-1 rounded-full text-white opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md" style={{ backgroundColor: 'var(--color-primary-accent)' }}>
                    <ZoomIn className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-2.5 bg-[#141417] border-t border-[#25252D] flex flex-col justify-between flex-1">
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-white transition-colors">
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

      {/* Lightbox Preview Modal matching Reference Design */}
      {activeItem && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
          onClick={() => {
            setActiveItem(null);
            setShowShareMenu(false);
          }}
        >
          {/* Top Control Bar */}
          <div className="w-full flex items-center justify-between z-[10000] shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span style={{ color: 'var(--color-primary-accent)' }} className="text-xs font-mono font-bold uppercase tracking-wider">
                {activeItem.category || 'Gallery'}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs font-bold text-white line-clamp-1">{activeItem.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="p-2.5 text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="Full Screen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setShowShareMenu(false);
                }}
                className="p-2.5 text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Left Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 border border-white/20 text-zinc-200 hover:text-white rounded-xl transition-all z-[10000] cursor-pointer shadow-2xl"
            title="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Center Image Container - 100% UNCROPPED ORIGINAL SIZE */}
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center my-auto p-2 overflow-hidden z-10" onClick={(e) => e.stopPropagation()}>
            <img
              src={getMediaUrl(activeItem.imageUrl)}
              alt={activeItem.title}
              className="max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              decoding="async"
            />
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 border border-white/20 text-zinc-200 hover:text-white rounded-xl transition-all z-[10000] cursor-pointer shadow-2xl"
            title="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Floating Action Bar matching Reference Design */}
          <div className="w-full flex flex-col items-center gap-3 z-[10000] shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-mono text-zinc-400 tracking-wider">
              {activeItem.title}
            </span>

            <div className="flex items-center justify-center gap-2 flex-wrap relative">
              <button
                type="button"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
                <span>FULL SCREEN</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(activeItem.imageUrl, activeItem.title)}
                style={{ backgroundColor: 'var(--color-primary-accent)' }}
                className="px-5 py-2.5 hover:opacity-90 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(activeItem)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'COPIED!' : 'SHARE'}</span>
              </button>

              {/* Share Options Drawer */}
              {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#18181C] border border-[#2D2D35] rounded-xl p-2.5 shadow-2xl z-50">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this photo from Rendezvous Silver Edition: ${activeItem.title}\n${activeItem.imageUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-[#25D366]/20 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeItem.imageUrl)}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="w-full text-left px-3 py-2 border border-white/20 hover:opacity-90 text-white text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
