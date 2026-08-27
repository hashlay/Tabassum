import React, { useEffect, useState } from 'react';
import { ParticipantProfileModal } from '../ParticipantProfileModal';
import { useFestival } from '../../context/FestivalContext';
import { Logo } from '../Logo';

export const ParticipantPortal: React.FC<{ onBackToApp?: () => void }> = ({ onBackToApp }) => {
  const { authUser, loginUnifiedByChestNo, logout } = useFestival();
  const [chestNoInput, setChestNoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlChest = params.get('chestNo') || params.get('chestNumber') || params.get('c') || params.get('id');
    if (urlChest) {
      setChestNoInput(urlChest);
      setLoading(true);
      loginUnifiedByChestNo(urlChest).finally(() => setLoading(false));
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chestNoInput.trim()) return;
    setLoading(true);
    setErrorMsg('');
    const res = await loginUnifiedByChestNo(chestNoInput.trim());
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Participant not found for that chest number.');
    }
  };

  // If logged in as participant, render the exact official Participant Profile Dashboard & Profile!
  if (authUser && authUser.role === 'participant' && authUser.participant) {
    return (
      <ParticipantProfileModal
        isOpen={true}
        onClose={() => {
          logout();
          if (onBackToApp) onBackToApp();
        }}
      />
    );
  }

  // Sign In card if not logged in
  return (
    <div className="min-h-screen bg-black/90 text-white flex items-center justify-center p-4 selection:bg-[#FF2B2B] font-sans relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-[#FF2B2B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[460px] bg-[#1E1E20] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 my-auto">
        <div className="flex items-center justify-between border-b border-[#333338] pb-3">
          <Logo size="sm" showSubBadge={false} />
        </div>

        <div>
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase font-mono block">
            PARTICIPANT PORTAL
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5 mb-1 font-sans">
            Participant Sign In
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed font-sans">
            Enter your chest number to view your participant dashboard, registered programs, and live certificates.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
              CHEST NUMBER
            </label>
            <input
              type="text"
              placeholder="e.g. 3014"
              value={chestNoInput}
              onChange={(e) => setChestNoInput(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-[#DC2626] text-[13px] font-sans pt-1 font-medium">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'LOADING DASHBOARD...' : 'SIGN IN TO PORTAL'}</span>
          </button>
        </form>

        {onBackToApp && (
          <div className="pt-2 border-t border-[#333338]/60 text-center">
            <button onClick={onBackToApp} className="text-xs text-zinc-400 hover:text-white hover:underline font-mono">
              ← Return to Main Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
