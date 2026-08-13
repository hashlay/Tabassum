import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoHighlight } from '../types';
import { Play, X, Download, Share2, Video, Maximize2 } from 'lucide-react';
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
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#18181B] border border-white/10 shadow-md sm:group-hover:border-white/30 transition-colors">
        {isVisible ? (
          video.thumbnailUrl ? (
            <img
              src={getMediaUrl(video.thumbnailUrl)}
              alt={video.title}
              className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback && video.videoUrl) {
                  target.dataset.triedFallback = 'true';
                  if (video.videoUrl.startsWith('/data/uploads/')) {
                    target.src = `https://rendevouz-8sfp.onrender.com/api${video.videoUrl}`;
                  }
                }
              }}
            />
          ) : (
            <video
              src={getMediaUrl(video.videoUrl)}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 sm:group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                if (!target.dataset.triedFallback && video.videoUrl) {
                  target.dataset.triedFallback = 'true';
                  if (video.videoUrl.startsWith('/data/uploads/')) {
                    target.src = `https://rendevouz-8sfp.onrender.com/api${video.videoUrl}`;
                  } else if (!video.videoUrl.startsWith('http')) {
                    target.src = `https://rendevouz-8sfp.onrender.com/api/data/uploads/${video.videoUrl.split('/').pop()}`;
                  }
                }
              }}
            />
          )
        ) : (
          <div className="w-full h-full bg-[#18181B] animate-pulse" />
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-black/40 sm:group-hover:bg-black/20 transition-colors" />

        {/* Red Circular Play Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ backgroundColor: 'var(--color-primary-accent)' }} className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg sm:group-hover:scale-110 transition-transform duration-300">
            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Title Text Underneath */}
      <div className="text-left">
        <h3 className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wide line-clamp-2 sm:group-hover:text-amber-400 transition-colors leading-snug">
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

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeVideo]);

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
          <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
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
            <div style={{ borderColor: 'var(--color-primary-accent)', borderTopColor: 'transparent' }} className="w-8 h-8 border-2 rounded-full animate-spin" />
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

      {/* Video Modal Player matching Reference Design */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          {/* Centered Modal Card */}
          <div
            className="relative max-w-4xl w-full bg-[#121215] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-3.5 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Control Bar */}
            <div className="w-full flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="px-2.5 py-0.5 bg-white/5 border rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeVideo.event}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{activeVideo.title}</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                      document.exitFullscreen().catch(() => {});
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Full Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Canvas Box */}
            <div className="relative w-full max-h-[60vh] sm:max-h-[65vh] aspect-video bg-black flex items-center justify-center overflow-hidden rounded-xl shrink-0 border border-white/10">
              <video
                src={getMediaUrl(activeVideo.videoUrl)}
                title={activeVideo.title}
                className="w-full h-full object-contain"
                autoPlay
                controls
                playsInline
                preload="auto"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  if (!target.dataset.triedFallback && activeVideo.videoUrl) {
                    target.dataset.triedFallback = 'true';
                    if (activeVideo.videoUrl.startsWith('/data/uploads/')) {
                      target.src = `https://rendevouz-8sfp.onrender.com/api${activeVideo.videoUrl}`;
                    } else if (!activeVideo.videoUrl.startsWith('http')) {
                      target.src = `https://rendevouz-8sfp.onrender.com/api/data/uploads/${activeVideo.videoUrl.split('/').pop()}`;
                    }
                  }
                }}
              />
            </div>

            {/* Bottom Caption & Action Bar matching Reference Design */}
            <div className="w-full flex flex-col items-center gap-2.5 mt-3 shrink-0">
              <span className="text-xs font-mono text-zinc-400 tracking-wider">
                {activeVideo.title} — Performer: {activeVideo.performer}
              </span>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                      document.exitFullscreen().catch(() => {});
                    }
                  }}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>FULL SCREEN</span>
                </button>

                {activeVideo.videoUrl && (
                  <a
                    href={getMediaUrl(activeVideo.videoUrl)}
                    download={`${activeVideo.title}.mp4`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="px-4 py-2 hover:opacity-90 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD</span>
                  </a>
                )}

                <button
                  onClick={() => handleShare(activeVideo)}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

VideoHighlights.displayName = 'VideoHighlights';
