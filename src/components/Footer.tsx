import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Logo } from './Logo';
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowUp, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, cmsSettings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080808] text-white pt-20 pb-12 relative overflow-hidden border-t border-white/10">
      {/* Background Watermark Wave Logo */}
      <div className="absolute -bottom-10 right-0 opacity-5 pointer-events-none select-none">
        <Logo size="xl" variant="icon" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Col 1: Branding */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`flex items-center gap-3 select-none`}>
              <div className="mb-6 md:mb-0">
                <Logo 
                  size="lg" 
                  variant="full" 
                  title={cmsSettings?.footerLogoTitle} 
                  subtitle={cmsSettings?.footerLogoSubtitle} 
                  badge={cmsSettings?.footerLogoBadge} 
                  customIconUrl={cmsSettings?.footerLogo}
                />
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md pt-2">
              {cmsSettings?.footerDescription || (
                <>
                  <strong>Rendezvous Silver Edition</strong> is the flagship Imam Rabbani LIFE Festival organized by Kulliyathu Imam Rabbani, a premier off-campus institute of Markaz Garden, Poonoor.
                </>
              )}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Festival Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  About & Concept
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Results Standings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('team-points')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Team Points
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('posters')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Winner Posters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('smile')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  SMILE Photo Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('live')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Live Stream
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Festival Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('highlights')}
                  className="hover:text-[#FF2B2B] transition-colors cursor-pointer"
                >
                  Video Highlights
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Socials */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              Institutional Contact
            </h4>

            <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF2B2B] shrink-0" />
                <span>{cmsSettings?.footerLocation || INSTITUTION.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF2B2B] shrink-0" />
                <span>{cmsSettings?.footerEmail || INSTITUTION.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF2B2B] shrink-0" />
                <span>{cmsSettings?.footerPhone || INSTITUTION.phone}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-mono text-zinc-500 block mb-2 uppercase">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={cmsSettings?.footerInstagram || INSTITUTION.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-[#FF2B2B] hover:text-white text-zinc-300 rounded-xl transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={cmsSettings?.footerYoutube || INSTITUTION.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-[#FF2B2B] hover:text-white text-zinc-300 rounded-xl transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={cmsSettings?.footerFacebook || INSTITUTION.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-[#FF2B2B] hover:text-white text-zinc-300 rounded-xl transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>{cmsSettings?.footerText || '© 2025 Kulliyathu Imam Rabbani (Markaz Garden Off-Campus). All rights reserved.'}</p>

          <button
            onClick={scrollToTop}
            className="p-3 bg-white/5 hover:bg-[#FF2B2B] hover:text-white text-zinc-400 rounded-full transition-all flex items-center gap-2"
          >
            <span className="text-[10px] uppercase font-bold">Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
