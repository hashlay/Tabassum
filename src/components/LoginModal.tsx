import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Camera } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { Logo } from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'participant';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginUnified } = useFestival();
  const [chestNumber, setChestNumber] = useState('');
  const [dob, setDob] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user') || params.get('chest') || params.get('code');
      if (userParam) {
        setChestNumber(userParam);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!chestNumber.trim() || !dob.trim()) {
      setErrorMsg('No participant found for that chest number and date of birth.');
      return;
    }
    const res = await loginUnified(chestNumber.trim(), dob.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'No participant found for that chest number and date of birth.');
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto py-8"
      onClick={onClose}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#FF2B2B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card matching Reference Design */}
      <div
        className="relative w-full max-w-[560px] min-h-[620px] bg-[#1E1E20] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header Bar */}
        <div className="flex items-center justify-between border-b border-[#333338] pb-3">
          <Logo size="sm" showSubBadge={false} />
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participant Portal Section Heading */}
        <div>
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase font-mono block">
            PARTICIPANT PORTAL
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5 mb-1 font-sans">
            Sign in
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed font-sans">
            Use the chest number on your badge and your date of birth.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
              CHEST NUMBER
            </label>
            <input
              type="text"
              placeholder="e.g. 1042"
              value={chestNumber}
              onChange={(e) => setChestNumber(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
              DATE OF BIRTH
            </label>
            <div className="relative flex items-center">
              <input
                ref={dateInputRef}
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl pl-4 pr-11 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <Calendar
                className="absolute right-4 w-5 h-5 text-zinc-500 cursor-pointer hover:text-white transition-colors"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker();
                  } catch (err) {
                    dateInputRef.current?.focus();
                  }
                }}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[#DC2626] text-[13px] font-sans pt-1">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            style={{ backgroundColor: 'var(--color-primary-accent)' }}
            className="w-full py-3.5 hover:opacity-90 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>SIGN IN</span>
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-zinc-400 text-[11px] font-medium text-left font-sans pt-1">
          Your details stay on your device and the official results service.
        </p>

      </div>
    </div>
  );
};
