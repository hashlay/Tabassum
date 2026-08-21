import React, { useState } from 'react';
import { ParticipantProfile } from '../../types';
import { DEMO_PARTICIPANTS } from '../../data/festivalData';
import {
  QrCode,
  Calendar,
  Award,
  Image as ImageIcon,
  Download,
  LogOut,
  User,
  Camera,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

import { Logo } from '../Logo';
import { useFestival } from '../../context/FestivalContext';

export const ParticipantPortal: React.FC<{ onBackToApp?: () => void }> = ({ onBackToApp }) => {
  const { eventSettings, loginUnified } = useFestival();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'dob' | 'qr'>('dob');
  const [chestNoInput, setChestNoInput] = useState('1042');
  const [dobInput, setDobInput] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pass' | 'competitions' | 'photos' | 'results' | 'certificates'>('dashboard');
  const [errorMsg, setErrorMsg] = useState('');

  const criteriaMode = eventSettings?.participantLoginCriteria || 'dob';
  const classStart = eventSettings?.classRangeStart ?? 1;
  const classEnd = eventSettings?.classRangeEnd ?? 10;
  const availableClasses: string[] = eventSettings?.availableClasses || Array.from({ length: Math.max(1, classEnd - classStart + 1) }, (_, i) => `Class ${classStart + i}`);

  const [activeParticipant, setActiveParticipant] = useState<ParticipantProfile>(DEMO_PARTICIPANTS[0]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const secVal = criteriaMode === 'class' ? selectedClass : dobInput;
    if (!chestNoInput.trim() || !secVal.trim()) {
      setErrorMsg(`No participant found for that chest number and ${criteriaMode === 'class' ? 'class' : 'date of birth'}.`);
      return;
    }
    const res = await loginUnified(chestNoInput.trim(), secVal.trim());
    if (res.success) {
      setIsLoggedIn(true);
    } else {
      const found = DEMO_PARTICIPANTS.find(p => p.codeNumber.toLowerCase() === chestNoInput.toLowerCase());
      if (found) {
        setActiveParticipant(found);
        setIsLoggedIn(true);
      } else {
        setErrorMsg(res.error || `No participant found for that chest number and ${criteriaMode === 'class' ? 'class' : 'date of birth'}.`);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4 selection:bg-[#FF2B2B] font-sans relative overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#FF2B2B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[450px] bg-[#1E1E20] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 my-auto">
          {/* Card Header Bar */}
          <div className="flex items-center justify-between border-b border-[#333338] pb-3">
            <Logo size="sm" showSubBadge={false} />
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
              Use the chest number on your badge and your {criteriaMode === 'class' ? 'class / grade' : 'date of birth'}.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                CHEST NUMBER
              </label>
              <input
                type="text"
                placeholder="e.g. 1042"
                value={chestNoInput}
                onChange={(e) => setChestNoInput(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            {criteriaMode === 'class' ? (
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                  CLASS / GRADE
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none transition-colors"
                >
                  <option value="">Select Class</option>
                  {availableClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                  DATE OF BIRTH
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-[#DC2626] text-[13px] font-sans pt-1">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>SIGN IN</span>
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-zinc-400 text-[11px] font-medium text-left font-sans pt-1">
            Your details stay on your device and the official results service.
          </p>

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
  }

  const p = activeParticipant;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col font-sans selection:bg-[#FF2B2B]">
      
      {/* Participant Navigation Header (Matching Public Website Styling) */}
      <header className="h-16 bg-[#141414] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={p.avatarUrl} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-[#FF2B2B]" />
          <div>
            <div className="text-sm font-black text-white">{p.name}</div>
            <div className="text-[10px] text-amber-400 font-mono font-bold">{p.codeNumber} • {p.department}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['dashboard', 'pass', 'competitions', 'photos', 'results', 'certificates'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition ${
                activeTab === tab ? 'bg-[#FF2B2B] text-white shadow-lg shadow-red-500/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-2 text-zinc-400 hover:text-red-400 rounded-xl hover:bg-white/10 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-red-950/30 via-[#141414] to-amber-950/30 border border-red-500/30 rounded-3xl flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-[#FF2B2B]/20 text-[#FF2B2B] font-mono text-[10px] font-bold rounded border border-red-500/30">
                  DELEGATE PORTAL
                </span>
                <h1 className="text-2xl font-black text-white mt-1">Welcome back, {p.name}!</h1>
                <p className="text-xs text-zinc-400 mt-1">Check your competition schedule, digital QR pass, and live announcements.</p>
              </div>
              <div className="text-right font-mono">
                <div className="text-3xl font-black text-amber-400">{p.schedule.length}</div>
                <div className="text-xs text-zinc-400">Registered Events</div>
              </div>
            </div>

            {/* Schedule */}
            <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Your Registered Competition Schedule</span>
              </h3>

              <div className="space-y-2">
                {p.schedule.map(sc => (
                  <div key={sc.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-white text-sm">{sc.program}</div>
                      <div className="text-zinc-400 mt-0.5">{sc.stage} • {sc.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-amber-300 font-bold">{sc.time}</div>
                      <span className="px-2 py-0.5 bg-red-500/20 text-[#FF2B2B] rounded font-bold text-[10px] uppercase border border-red-500/30">
                        {sc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Digital ID Pass */}
        {activeTab === 'pass' && (
          <div className="p-8 bg-[#141414] border border-white/10 rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-2xl">
            <div className="p-6 bg-gradient-to-b from-black to-[#141414] border-2 border-[#FF2B2B]/50 rounded-2xl space-y-3">
              <img src={p.avatarUrl} alt={p.name} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-400 shadow-xl" />
              <div className="text-3xl font-black text-amber-400 font-mono tracking-widest">{p.codeNumber}</div>
              <div className="text-xl font-extrabold text-white">{p.name}</div>
              <div className="text-xs text-zinc-300">{p.department} • {p.category}</div>
              <div className="w-20 h-20 bg-white p-1.5 rounded-xl mx-auto mt-4 shadow-lg">
                <QrCode className="w-full h-full text-black" />
              </div>
            </div>
            <button
              onClick={() => alert("Registration Receipt & Pass PDF Downloaded!")}
              className="w-full py-3 bg-[#FF2B2B] hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" /> Download Official Registration Pass
            </button>
          </div>
        )}

        {/* Tab 3: Competitions */}
        {activeTab === 'competitions' && (
          <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white">Registered Competitions Roster</h3>
            <div className="space-y-2 text-xs">
              {p.schedule.map(sc => (
                <div key={sc.id} className="p-3 bg-white/5 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-white">{sc.program}</span>
                  <span className="text-amber-400 font-mono font-bold">{sc.stage} ({sc.time})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Photos */}
        {activeTab === 'photos' && (
          <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl text-center space-y-3 shadow-xl">
            <ImageIcon className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-base font-extrabold text-white">SMILE AI Tagged Photos Portal</h3>
            <p className="text-xs text-zinc-400">Facial recognition embeddings filter your stage performance photo album.</p>
          </div>
        )}

        {/* Tab 5: Results */}
        {activeTab === 'results' && (
          <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white">Your Competition Results</h3>
            {p.results.length > 0 ? (
              <div className="space-y-2">
                {p.results.map(r => (
                  <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-white">{r.eventName}</div>
                      <div className="text-xs text-amber-400 font-mono font-bold">Rank #{r.rank} • Grade {r.grade}</div>
                    </div>
                    <span className="text-lg font-black text-[#FF2B2B] font-mono">{r.points} Pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 text-center py-4">No published results yet for registered events.</div>
            )}
          </div>
        )}

        {/* Tab 6: Certificates */}
        {activeTab === 'certificates' && (
          <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl text-center space-y-4 shadow-xl">
            <Award className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black text-white">Official Merit & Participation Certificates</h3>
            <button
              onClick={() => alert("Certificate PDF Generated!")}
              className="px-6 py-2.5 bg-[#F59E0B] text-black hover:bg-amber-400 rounded-xl text-xs font-extrabold shadow"
            >
              Download PDF Certificate
            </button>
          </div>
        )}

      </main>

    </div>
  );
};
