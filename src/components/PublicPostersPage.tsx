import React, { useState, useMemo } from 'react';
import { useFestival } from '../context/FestivalContext';
import { Category, ResultItem } from '../types';
import { Search, ChevronDown, Download, X, Share2, ZoomIn, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { PosterImage } from './PosterImage';

interface CompetitionPoster {
  id: string;
  eventName: string;
  category: Category;
  compIndex: number;
  results: ResultItem[];
  imageUrl: string;
}

export const PublicPostersPage: React.FC = () => {
  const { results = [], categories = [] } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePoster, setActivePoster] = useState<CompetitionPoster | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Group verified published results by Competition (competitionId or eventName + category)
  // Sort so latest announced is at the top
  const competitionPosters = useMemo(() => {
    const competitionMap = new Map<string, { results: ResultItem[]; latestUpdatedAt: string }>();

    // Filter to valid published ranks (Rank 1, 2, 3) - EXACTLY matching PublishedResultsPage logic
    const validResults = (results || []).filter(r => r.rank !== undefined && r.rank > 0 && r.rank <= 3);

    // Group items by competition
    validResults.forEach((res) => {
      const key = res.competitionId || `${res.eventName}__${res.category}`;
      const updatedAt = res.raw?.updatedAt || res.raw?.createdAt || '';
      if (!competitionMap.has(key)) {
        competitionMap.set(key, { results: [], latestUpdatedAt: updatedAt });
      }
      const group = competitionMap.get(key)!;
      group.results.push(res);
      if (updatedAt > group.latestUpdatedAt) {
        group.latestUpdatedAt = updatedAt;
      }
    });

    // Sort ascending by updatedAt to assign announcement numbers (1 = first announced)
    const sortedEntries = Array.from(competitionMap.entries()).sort((a, b) =>
      a[1].latestUpdatedAt.localeCompare(b[1].latestUpdatedAt)
    );

    // Create posters with announcement numbers
    const posters: CompetitionPoster[] = sortedEntries.map(([key, data], index) => {
      const first = data.results[0];
      return {
        id: `comp-post-${index}`,
        eventName: first.eventName,
        category: first.category as Category,
        compIndex: index + 1, // Announcement number (1 = first announced)
        results: data.results,
        imageUrl: ''
      };
    });

    // Reverse so latest announced appears first on the page
    return posters.reverse();
  }, [results]);

  const filteredPosters = useMemo(() => {
    return competitionPosters.filter((poster) => {
      const matchesCategory = selectedCategory === 'All' || poster.category === selectedCategory;
      const matchesQuery =
        searchQuery === '' ||
        poster.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [competitionPosters, selectedCategory, searchQuery]);

  const handleDownload = async (poster: CompetitionPoster) => {
    try {
      const fileName = `Result_Poster_${poster.category}_${poster.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      if (poster.imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = poster.imageUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(poster.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (_) {
      if (poster.imageUrl) window.open(poster.imageUrl, '_blank');
    }
  };

  const handleShare = async (poster: CompetitionPoster) => {
    const text = `🏆 Official Result Poster: ${poster.eventName} (${poster.category}) - Sahityotsav Festival Results!`;
    const shareUrl = window.location.origin + '/results?category=' + encodeURIComponent(poster.category) + '&event=' + encodeURIComponent(poster.eventName);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${poster.eventName} - Result Poster`,
          text: text,
          url: shareUrl
        });
        return;
      } catch (_) {}
    }

    setShowShareMenu(true);
  };

  const handleCopyLink = (poster: CompetitionPoster) => {
    const shareUrl = window.location.origin + '/results?category=' + encodeURIComponent(poster.category) + '&event=' + encodeURIComponent(poster.eventName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNext = () => {
    if (!activePoster) return;
    const currentIndex = filteredPosters.findIndex(p => p.id === activePoster.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredPosters.length;
    setActivePoster(filteredPosters[nextIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handlePrev = () => {
    if (!activePoster) return;
    const currentIndex = filteredPosters.findIndex(p => p.id === activePoster.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredPosters.length) % filteredPosters.length;
    setActivePoster(filteredPosters[prevIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-20 sm:pt-24 pb-16 font-sans selection:bg-[#FF2B2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6 border-b border-[#2A2A30] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Competition Posters
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              Verified official result posters generated per competition event.
            </p>
          </div>

          <div className="bg-[#161619] border border-[#2D2D35] px-3.5 py-2 rounded-xl shrink-0 font-mono text-xs text-zinc-300">
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-bold">{filteredPosters.length}</span> Posters Generated
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
          {/* Search Bar */}
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161619] border border-[#2D2D35] focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Select */}
          <div className="sm:col-span-4 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="w-full bg-[#161619] border border-[#2D2D35] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white font-mono appearance-none focus:outline-none transition-colors pr-10 cursor-pointer"
            >
              <option value="All">All categories</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Clean Image Grid or Empty State */}
        {filteredPosters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosters.map((poster) => (
              <div key={poster.id} className="group flex flex-col gap-2">
                <div 
                  onClick={() => setActivePoster(poster)}
                  className="relative aspect-[4/5] bg-[#161619] border border-white/10 rounded-xl overflow-hidden cursor-pointer group-hover:border-white/40 transition-colors shadow-lg"
                >
                  <PosterImage
                    competitionId={poster.id}
                    eventName={poster.eventName}
                    category={poster.category}
                    compIndex={poster.compIndex}
                    results={poster.results}
                    className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-500"
                    onLoadUrl={(url) => { poster.imageUrl = url; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100 duration-300" />
                  </div>
                </div>
                <div className="px-1 text-center">
                  <h3 className="font-competition-title font-bold text-sm sm:text-base text-white tracking-snug line-clamp-1">
                    {poster.eventName}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 uppercase tracking-wider">
                    {poster.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#161619] border border-[#2A2A32] rounded-2xl text-zinc-400 font-mono text-xs space-y-1">
            <div className="text-sm uppercase tracking-widest text-zinc-500">Result is not published</div>
            <div className="text-[11px] text-zinc-500">Results will appear here once competitions are completed.</div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activePoster && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            setActivePoster(null);
            setShowShareMenu(false);
          }}
        >
          <div
            className="relative max-w-4xl w-full bg-[#18181B] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#141416] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="px-2.5 py-0.5 bg-white/5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activePoster.category} Category
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">{activePoster.eventName}</h3>
              </div>

              <button
                onClick={() => {
                  setActivePoster(null);
                  setShowShareMenu(false);
                }}
                className="p-1.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Canvas Image Box */}
            <div className="relative w-full max-h-[60vh] bg-black flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
              {filteredPosters.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-200 hover:text-white bg-black/70 border border-white/15 rounded-full transition-colors z-20 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              <PosterImage
                competitionId={activePoster.id}
                eventName={activePoster.eventName}
                category={activePoster.category}
                compIndex={activePoster.compIndex}
                results={activePoster.results}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
                onLoadUrl={(url) => { activePoster.imageUrl = url; }}
              />

              {filteredPosters.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-200 hover:text-white bg-black/70 border border-white/15 rounded-full transition-colors z-20 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#121214] border-t border-white/10 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-white">{activePoster.eventName}</h4>
                  <p className="text-xs text-zinc-400 font-mono">Official Verified Result Poster</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 relative">
                  <button
                    onClick={() => handleShare(activePoster)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer min-h-[38px]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => handleDownload(activePoster)}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="px-4 py-2 hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 shadow-lg cursor-pointer min-h-[38px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HD</span>
                  </button>

                  {/* Share Menu Popup */}
                  {showShareMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1C1C21] border border-[#33333D] rounded-xl p-2 shadow-2xl z-50">
                      <button
                        onClick={() => handleCopyLink(activePoster)}
                        className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Link Copied!' : 'Copy Result Link'}
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 Official Result Poster: ${activePoster.eventName} (${activePoster.category}) - ${window.location.origin}/results?category=${encodeURIComponent(activePoster.category)}&event=${encodeURIComponent(activePoster.eventName)}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-[#25D366]/20 rounded-lg transition-colors flex items-center gap-2 mt-1"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                        Share on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
