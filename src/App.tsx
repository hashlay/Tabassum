import React, { useState } from 'react';
import { FestivalProvider, useFestival } from './context/FestivalContext';
import { ParticipantPortal } from './components/participant/ParticipantPortal';
import { Category } from './types';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SmilePhotoPortal } from './components/SmilePhotoPortal';
import { LiveStreamSection } from './components/LiveStreamSection';
import { GallerySection } from './components/GallerySection';
import { VideoHighlights } from './components/VideoHighlights';
import { ResultsSection } from './components/ResultsSection';
import { FullConceptModal } from './components/FullConceptModal';
import { LoginModal } from './components/LoginModal';
import { ParticipantProfileModal } from './components/ParticipantProfileModal';
import { FaceScannerModal } from './components/FaceScannerModal';
import { PublishedResultsPage } from './components/PublishedResultsPage';
import { TeamPointsPage } from './components/TeamPointsPage';
import { PublicPostersPage } from './components/PublicPostersPage';
import { PublicGalleryPage } from './components/PublicGalleryPage';
import { Footer } from './components/Footer';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#18181C] border border-[#2D2D35] p-8 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto text-xl font-mono font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Reset App Data & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicWebsiteContent({ onSwitchToApp }: { onSwitchToApp: (mode: 'workspace' | 'participant') => void }) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [cmsData, setCmsData] = useState<any>(null);
  const [resultsFilter, setResultsFilter] = useState<{ category: Category; eventName: string }>({
    category: 'All',
    eventName: 'All'
  });

  const [pageView, setPageView] = useState<'home' | 'results' | 'team-points' | 'posters' | 'gallery'>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('gallery')) return 'gallery';
    if (path.includes('posters')) return 'posters';
    if (path.includes('team-points') || path.includes('standings')) return 'team-points';
    if (path.includes('results')) return 'results';
    return 'home';
  });

  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginInitialTab,
    activeModalView,
    setActiveModalView
  } = useFestival();

  React.useEffect(() => {
    fetch(`/api/public/cms?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setCmsData(data);
        const theme = data?.cmsSettings?.colorTheme;
        if (theme) {
          const root = document.documentElement;
          if (theme.primaryAccent) root.style.setProperty('--color-primary-accent', theme.primaryAccent);
          if (theme.bodyBg) root.style.setProperty('--color-body-bg', theme.bodyBg);
          if (theme.cardBg) root.style.setProperty('--color-card-bg', theme.cardBg);
          if (theme.cardElevatedBg) root.style.setProperty('--color-card-elevated-bg', theme.cardElevatedBg);
          if (theme.borderSubtle) root.style.setProperty('--color-border-subtle', theme.borderSubtle);
          if (theme.textPrimary) root.style.setProperty('--color-text-primary', theme.textPrimary);
          if (theme.textSecondary) root.style.setProperty('--color-text-secondary', theme.textSecondary);
          if (theme.textMuted) root.style.setProperty('--color-text-muted', theme.textMuted);
          if (theme.goldAccent) root.style.setProperty('--color-gold-accent', theme.goldAccent);
          if (theme.successAccent) root.style.setProperty('--color-success-accent', theme.successAccent);

          // Inject dynamic CSS overrides for all Tailwind arbitrary hex classes
          // This makes bg-[#FF2B2B], text-[#FF2B2B], border-[#2A2A32] etc. respond to CMS color changes
          const existingStyle = document.getElementById('cms-theme-overrides');
          if (existingStyle) existingStyle.remove();

          const style = document.createElement('style');
          style.id = 'cms-theme-overrides';

          // Map: CSS variable name → array of hex values it replaces
          const colorMap: Record<string, string[]> = {
            'var(--color-primary-accent)': ['#FF2B2B', '#ff2b2b', '#DC2626', '#dc2626'],
            'var(--color-body-bg)': ['#0D0D0D', '#0d0d0d', '#0D0D0F', '#0d0d0f'],
            'var(--color-card-bg)': ['#161619', '#1B1B1F', '#1b1b1f'],
            'var(--color-card-elevated-bg)': ['#1A1A1E', '#1a1a1e', '#222228'],
            'var(--color-border-subtle)': ['#2A2A32', '#2a2a32', '#2D2D35', '#2d2d35'],
            'var(--color-text-secondary)': ['#E4E4E7', '#e4e4e7'],
            'var(--color-text-muted)': ['#A1A1AA', '#a1a1aa'],
            'var(--color-gold-accent)': ['#F59E0B', '#f59e0b'],
            'var(--color-success-accent)': ['#10B981', '#10b981'],
          };

          let css = '';
          for (const [cssVar, hexes] of Object.entries(colorMap)) {
            for (const hex of hexes) {
              // Escape the hex for CSS selector (# becomes \\#)
              const escaped = hex.replace('#', '\\#');
              // Background color overrides
              css += `.bg-\\[${escaped}\\]{background-color:${cssVar}!important}\n`;
              // Text color overrides
              css += `.text-\\[${escaped}\\]{color:${cssVar}!important}\n`;
              // Border color overrides
              css += `.border-\\[${escaped}\\]{border-color:${cssVar}!important}\n`;
              // Focus border overrides
              css += `.focus\\:border-\\[${escaped}\\]:focus{border-color:${cssVar}!important}\n`;
              // Hover background overrides
              css += `.hover\\:bg-\\[${escaped}\\]:hover{background-color:${cssVar}!important}\n`;
              // Hover border overrides
              css += `.hover\\:border-\\[${escaped}\\]:hover{border-color:${cssVar}!important}\n`;
              // Hover text overrides
              css += `.hover\\:text-\\[${escaped}\\]:hover{color:${cssVar}!important}\n`;
              // Group-hover text overrides
              css += `.group:hover .sm\\:group-hover\\:text-\\[${escaped}\\]{color:${cssVar}!important}\n`;
              css += `.group-hover\\:text-\\[${escaped}\\]{color:${cssVar}!important}\n`;
              // Selection color
              css += `.selection\\:bg-\\[${escaped}\\] ::selection{background-color:${cssVar}!important}\n`;
              // Gradient stops
              css += `.from-\\[${escaped}\\]{--tw-gradient-from:${cssVar}!important}\n`;
              css += `.via-\\[${escaped}\\]{--tw-gradient-via:${cssVar}!important}\n`;
              css += `.to-\\[${escaped}\\]{--tw-gradient-to:${cssVar}!important}\n`;
              // Hover gradient stops
              css += `.hover\\:from-\\[${escaped}\\]:hover{--tw-gradient-from:${cssVar}!important}\n`;
              css += `.hover\\:to-\\[${escaped}\\]:hover{--tw-gradient-to:${cssVar}!important}\n`;
              // Ring color
              css += `.ring-\\[${escaped}\\]{--tw-ring-color:${cssVar}!important}\n`;
              // Placeholder
              css += `.placeholder\\:text-\\[${escaped}\\]::placeholder{color:${cssVar}!important}\n`;

              // Handle opacity modifiers: /5, /10, /15, /20, /30, /40, /50, /60, /70, /80, /90
              for (const opacity of [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90]) {
                css += `.bg-\\[${escaped}\\]\\/${opacity}{background-color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.text-\\[${escaped}\\]\\/${opacity}{color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.border-\\[${escaped}\\]\\/${opacity}{border-color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.hover\\:bg-\\[${escaped}\\]\\/${opacity}:hover{background-color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.from-\\[${escaped}\\]\\/${opacity}{--tw-gradient-from:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.via-\\[${escaped}\\]\\/${opacity}{--tw-gradient-via:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.to-\\[${escaped}\\]\\/${opacity}{--tw-gradient-to:color-mix(in srgb,${cssVar} ${opacity}%,transparent)!important}\n`;
                css += `.shadow-\\[${escaped}\\]\\/${opacity}{--tw-shadow-color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)}\n`;
                css += `.hover\\:shadow-\\[${escaped}\\]\\/${opacity}:hover{--tw-shadow-color:color-mix(in srgb,${cssVar} ${opacity}%,transparent)}\n`;
              }
            }
          }

          style.textContent = css;
          document.head.appendChild(style);
        }
      })
      .catch(err => console.error('Failed to load CMS data:', err));
  }, []);

  const handleNavigate = (sectionId: string, filter?: { category?: Category; eventName?: string }) => {
    if (filter) {
      setResultsFilter({
        category: filter.category || 'All',
        eventName: filter.eventName || 'All'
      });
    }

    if (sectionId === 'gallery' || sectionId === 'full-gallery') {
      setPageView('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/gallery') {
        window.history.pushState({}, '', '/gallery');
      }
      return;
    }
    if (sectionId === 'posters') {
      setPageView('posters');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/posters') {
        window.history.pushState({}, '', '/posters');
      }
      return;
    }
    if (sectionId === 'results') {
      setPageView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/results') {
        window.history.pushState({}, '', '/results');
      }
      return;
    }
    if (sectionId === 'team-points' || sectionId === 'standings') {
      setPageView('team-points');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/team-points') {
        window.history.pushState({}, '', '/team-points');
      }
      return;
    }

    setPageView('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-emerald-500 font-sans antialiased overflow-x-hidden relative">
      <Header activeSection={pageView === 'home' ? activeSection : pageView} onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} dragBlocks={cmsData?.dragBlocks} />

      <main>
        {pageView === 'gallery' ? (
          <PublicGalleryPage />
        ) : pageView === 'posters' ? (
          <PublicPostersPage />
        ) : pageView === 'results' ? (
          <PublishedResultsPage
            initialCategory={resultsFilter.category}
            initialEvent={resultsFilter.eventName}
            onClearFilter={() => setResultsFilter({ category: 'All', eventName: 'All' })}
          />
        ) : pageView === 'team-points' ? (
          <TeamPointsPage />
        ) : (
          <>
            {cmsData?.dragBlocks && cmsData.dragBlocks.length > 0 ? (
              cmsData.dragBlocks
                .filter((b: any) => b.enabled)
                .sort((a: any, b: any) => a.order - b.order)
                .map((block: any) => {
                  switch (block.type) {
                    case 'hero':
                      return <HeroSection key="hero" onNavigate={handleNavigate} cmsSettings={cmsData.cmsSettings} heroMedia={cmsData.heroMedia} />;
                    case 'about':
                      return <AboutSection key="about" onOpenConceptModal={() => setIsConceptModalOpen(true)} cmsSettings={cmsData.cmsSettings} />;
                    case 'results':
                      return <ResultsSection key="results" onNavigate={handleNavigate} />;
                    case 'smile':
                    case 'photohub':
                      return <SmilePhotoPortal key="smile" cmsSettings={cmsData?.cmsSettings} />;
                    case 'gallery':
                      return <GallerySection key="gallery" onNavigate={handleNavigate} />;
                    case 'live_stream':
                    case 'live_stages':
                      return <LiveStreamSection key="live_stream" />;
                    case 'highlights':
                      return <VideoHighlights key="highlights" />;
                    default:
                      return null;
                  }
                })
            ) : (
              <>
                <HeroSection onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} heroMedia={cmsData?.heroMedia} />
                <AboutSection onOpenConceptModal={() => setIsConceptModalOpen(true)} cmsSettings={cmsData?.cmsSettings} />
                <ResultsSection onNavigate={handleNavigate} />
                <SmilePhotoPortal cmsSettings={cmsData?.cmsSettings} />
                <GallerySection onNavigate={handleNavigate} />
                <LiveStreamSection />
                <VideoHighlights />
              </>
            )}
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} />

      <FullConceptModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        cmsSettings={cmsData?.cmsSettings}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialTab={loginInitialTab}
      />

      <ParticipantProfileModal
        isOpen={activeModalView === 'participant-profile'}
        onClose={() => setActiveModalView('none')}
      />

      <FaceScannerModal
        isOpen={activeModalView === 'face-scanner'}
        onClose={() => setActiveModalView('none')}
      />
    </div>
  );
}

export default function App() {
  const [appMode, setAppModeState] = useState<'participant' | 'public'>(() => {
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const portalParam = (searchParams.get('portal') || searchParams.get('mode'))?.toLowerCase();
    const port = window.location.port;

    if (portalParam === 'participant' || path.startsWith('/participant') || port === '3002') {
      return 'participant';
    }
    return 'public';
  });

  const setAppMode = (mode: 'participant' | 'public') => {
    setAppModeState(mode);
    const newPath = mode === 'participant' ? '/participant' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  return (
    <ErrorBoundary>
      <FestivalProvider>
        {appMode === 'participant' ? (
          <div className="relative">
            <ParticipantPortal onBackToApp={() => setAppMode('public')} />
          </div>
        ) : (
          <PublicWebsiteContent onSwitchToApp={(mode) => setAppMode(mode as any)} />
        )}
      </FestivalProvider>
    </ErrorBoundary>
  );
}
