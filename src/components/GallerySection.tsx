import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { ZoomIn, ArrowRight, X, ChevronLeft, ChevronRight, Download, Share2, Check, Send, Copy, Image as ImageIcon } from 'lucide-react';

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

    setShowShareMenu(true);
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
    <section id="gallery" className="py-10 sm:py-14 bg-[#121214] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3 border-b border-white/10 pb-5">
          <div>
            <span className="text-[#FF2B2B] font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
              FROM THE GROUND
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Gallery
            </h2>
            <p className="text-zinc-400 text-xs font-sans mt-0.5">
              Scenes from Campus as the festival unfolds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('gallery');
              } else {
                window.location.pathname = '/gallery';
              }
            }}
            className="text-[#FF2B2B] hover:text-red-400 font-extrabold text-xs font-mono tracking-wider hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-end uppercase cursor-pointer transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF2B2B]/30 border-t-[#FF2B2B] rounded-full animate-spin" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20 bg-[#18181B]/50 rounded-2xl border border-white/5">
            <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
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
                className={`group cursor-pointer relative rounded-xl overflow-hidden bg-[#18181B] border border-white/5 ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                style={index === 0 ? { aspectRatio: '4/3' } : { aspectRatio: '1/1' }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  loading={index < 4 ? "eager" : "lazy"}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-[#FF2B2B] font-mono font-bold uppercase tracking-wider mb-1 block">
                        {item.category}
                      </span>
                      <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-1 group-hover:text-[#FF2B2B] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
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

          <div className="max-w-4xl w-full flex flex-col items-center">
            {/* Image Box */}
            <div className="relative w-full max-h-[65vh] aspect-video bg-black rounded-xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Action Buttons Bar */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleDownload(activeItem.imageUrl, activeItem.title)}
                className="px-4 py-2 bg-black/60 hover:bg-[#FF2B2B] border border-white/20 hover:border-[#FF2B2B] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(activeItem)}
                className="px-4 py-2 bg-black/60 hover:bg-[#FF2B2B] border border-white/20 hover:border-[#FF2B2B] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED!' : 'SHARE'}</span>
              </button>
            </div>

            {/* Share Options Drawer / Modal */}
            {showShareMenu && (
              <div className="mt-3 p-3 bg-[#18181C] border border-[#2D2D35] rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
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
    </section>
  );
};
