import React from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Camera, ExternalLink } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';

interface SmilePhotoPortalProps {
  cmsSettings?: any;
}

export const SmilePhotoPortal: React.FC<SmilePhotoPortalProps> = ({ cmsSettings }) => {
  const { eventSettings } = useFestival();
  
  // Link set by admin in CMS Website Studio (or event settings fallback)
  const driveLink = cmsSettings?.photoHubDriveLink || eventSettings?.photoHubDriveLink || 'https://drive.google.com/drive/folders/1cQNek6Q2EiThqdFrUDb1I8cfsmQneP1J';

  return (
    <section id="smile" className="py-10 sm:py-14 bg-[#0A0A0A] relative overflow-hidden border-b border-white/10 font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[#FF2B2B]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Header Title */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2B2B]/15 border border-[#FF2B2B]/40 text-[#FF2B2B] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5 text-[#FF2B2B]" />
            <span>Official Photo Download Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            PHOTO HUB — <span className="text-[#FF2B2B]">FESTIVAL MEMORIES</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed font-sans">
            Scan the QR code or click the button below to directly access and download official festival photos in high resolution.
          </p>
        </div>

        {/* Centered Interactive QR Scanner Frame & Drive Action Button */}
        <div className="max-w-sm mx-auto bg-[#141416] border border-white/15 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF2B2B]/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          {/* QR Frame Container - Clickable to Drive */}
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 w-48 h-48 sm:w-52 sm:h-52 mx-auto bg-black p-3 rounded-xl border-2 border-[#FF2B2B]/50 hover:border-[#FF2B2B] shadow-xl flex flex-col items-center justify-center mb-6 block transition-all group/qr cursor-pointer"
            title="Click to open Photo Drive"
          >
            {/* Corner markers */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FF2B2B]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#FF2B2B]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#FF2B2B]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FF2B2B]" />

            {/* Rendered QR Code */}
            <div className="p-2.5 bg-white rounded-lg shadow-inner w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center group-hover/qr:scale-105 transition-transform">
              <QRCode value={driveLink} size={135} level="M" />
            </div>

            <span className="text-[9px] font-mono text-zinc-400 mt-1 font-bold tracking-widest uppercase">
              PHOTO HUB • 2026
            </span>
          </a>

          {/* Real Red Button Link Directing to Admin Dashboard Drive Link */}
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 w-full py-3.5 bg-gradient-to-r from-[#FF2B2B] to-[#B30000] hover:from-[#FF4444] hover:to-[#E60000] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF2B2B]/30 hover:shadow-[#FF2B2B]/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group border border-[#FF2B2B]/50 active:scale-[0.98] block"
          >
            <QrCode className="w-4 h-4" />
            <span>SCAN QR / OPEN PHOTO DRIVE</span>
            <ExternalLink className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
