import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoHighlight } from '../types';
import { Play, X, Download, Share2, Video } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUrl';

// Lazy-rendered card that only mounts when visible in viewport
const VideoCard: React.FC<{
  video: VideoHighlight;
  onPlay: (v: VideoHighlight) => void;
}> = React.memo(({ video, onPlay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onPlay(video)}
      className="group cursor-pointer space-y-2"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#18181B] border border-[#333338] shadow-md sm:group-hover:border-[#FF2B2B]/60 transition-colors">
        {isVisible ? (
          video.thumbnailUrl ? (
            <img
              src={getMediaUrl(video.thumbnailUrl)}
              alt={video.title}
              className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          ) : (
            /* Static placeholder instead of <video> — prevents mobile lag */
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1f] to-[#111114] flex items-center justify-center">
              <Video className="w-8 h-8 text-zinc-700" />
            </div>
          )
        ) : (
          /* Skeleton placeholder before IntersectionObserver fires */
          <div className="w-full h-full bg-[#18181B] animate-pulse" />
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-black/40 sm:group-hover:bg-black/20 transition-colors" />

        {/* Red Circular Play Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-red-950/50 sm:group-hover:scale-110 transition-transform duration-300">
            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Title Text Underneath */}
      <div className="text-left">
        <h3 className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wide line-clamp-2 sm:group-hover:text-[#FF2B2B] transition-colors leading-snug">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{video.performer}</p>
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export const VideoHighlights: React.FC = React.memo(() => {
  const [activeVideo, setActiveVideo] = useState<VideoHighlight | null>(null);
  const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/highlights')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setHighlights(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch highlights:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handlePlay = useCallback((video: VideoHighlight) => {
    setActiveVideo(video);
  }, []);

  const handleClose = useCallback(() => {
    setActiveVideo(null);
  }, []);

  const handleShare = useCallback(async (video: VideoHighlight) => {
    const text = `Check out this amazing performance: ${video.title} by ${video.performer} at SSF Sahityotsav!`;
    const url = window.location.origin + video.videoUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text, url });
      } catch (_) {}
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  }, []);

  const handleDownload = useCallback((video: VideoHighlight) => {
    const a = document.createElement('a');
    a.href = getMediaUrl(video.videoUrl);
    a.download = `${video.title.replace(/\s+/g, '_')}_highlight.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return (
    <section id="highlights" className="py-10 sm:py-14 bg-[#0E0E10] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-6 border-b border-white/10 pb-5">
          <span className="text-[#FF2B2B] font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
            REPLAY
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Videos
          </h2>
          <p className="text-zinc-400 text-xs font-sans mt-0.5">
            Recaps and moments worth a second watch.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF2B2B]/30 border-t-[#FF2B2B] rounded-full animate-spin" />
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-center py-20 bg-[#18181B]/50 rounded-2xl border border-white/5">
            <Video className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No highlights available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {highlights.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Player — no backdrop-blur on mobile for performance */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-zinc-400 hover:text-white bg-white/10 rounded-full transition-colors z-50 cursor-pointer hover:bg-white/20"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-5xl w-full bg-[#18181B] border border-white/15 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative aspect-video bg-black flex-shrink-0">
              <video
                src={getMediaUrl(activeVideo.videoUrl)}
                title={activeVideo.title}
                className="w-full h-full object-contain"
                autoPlay
                controls
                controlsList="nodownload"
                playsInline
                preload="auto"
              />
            </div>
            
            <div className="p-4 sm:p-6 bg-[#121214] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#FF2B2B]/10 text-[#FF2B2B] border border-[#FF2B2B]/20 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                      {activeVideo.event}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono uppercase">{activeVideo.stageName}</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">{activeVideo.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">Performer: <span className="text-zinc-200">{activeVideo.performer}</span></p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleShare(activeVideo)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => handleDownload(activeVideo)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-red-900/20 min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download HD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

VideoHighlights.displayName = 'VideoHighlights';
