import React, { useState, useMemo } from 'react';
import { X, User, QrCode, Calendar, Award, Sparkles, Download, ScanFace, CheckCircle, ExternalLink, ShieldCheck, MapPin, Printer } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { CertificateImage } from './CertificateImage';
import { PosterImage } from './PosterImage';

interface ParticipantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to format Date of Birth nicely (e.g. 2007-09-27 -> 27-Sep-2007)
function formatDobDisplay(dob?: string): string {
  if (!dob) return 'N/A';
  try {
    const parts = dob.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}-${year}`;
      }
    }
    const d = new Date(dob);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
    }
  } catch (e) { }
  return dob;
}

export const ParticipantProfileModal: React.FC<ParticipantProfileModalProps> = ({ isOpen, onClose }) => {
  const { authUser, logout, updateParticipant, results: allResults = [] } = useFestival();

  if (!isOpen || !authUser || authUser.role !== 'participant' || !authUser.participant) {
    return null;
  }

  const p = authUser.participant;

  const handleClosePortal = () => {
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('chestNo');
      newUrl.searchParams.delete('chestNumber');
      newUrl.searchParams.delete('c');
      newUrl.searchParams.delete('id');
      newUrl.pathname = '/';
      window.history.pushState({ page: 'home' }, '', newUrl.toString());
    }
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateParticipant({
          ...p,
          avatarUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = (dataUrl: string) => {
    const win = window.open('');
    win?.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;" onload="window.print();window.close();" />`);
  };

  const handleShare = async (title: string, text: string, dataUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.href });
      } catch (e) { }
    } else {
      alert(`${title}: ${text}`);
    }
  };

  const cleanName = p.name ? p.name.replace(/\s*\(\d+\)$/, '') : 'Participant';
  const deptName = p.department || 'Ninthikal Team';
  const catName = p.category || 'General';
  const dobFormatted = formatDobDisplay(p.dob);

  // Build exact competition posters list as in PublicPostersPage.tsx
  const competitionPosters = useMemo(() => {
    const competitionMap = new Map<string, { results: any[]; latestUpdatedAt: string }>();
    const validResults = (allResults || []).filter(r => r.rank !== undefined && r.rank > 0 && r.rank <= 3);

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

    const sortedEntries = Array.from(competitionMap.entries()).sort((a, b) =>
      a[1].latestUpdatedAt.localeCompare(b[1].latestUpdatedAt)
    );

    return sortedEntries.map(([key, data], index) => {
      const first = data.results[0];
      return {
        key,
        id: `comp-post-${index}`,
        eventName: first.eventName,
        category: first.category,
        compIndex: index + 1,
        results: data.results,
      };
    });
  }, [allResults]);

  // Dynamically compute ALL declared results for ONLY this participant's registered programs & wins
  const participantDeclaredResults = useMemo(() => {
    if (!p) return [];

    const participantId = p.id || (p as any).raw?.id;
    const participantCode = (p.codeNumber || p.chestNumber || '').toString().trim().toLowerCase();
    const participantName = (p.name || p.fullName || '').trim().toLowerCase();
    const participantUnit = (p.department || p.unitName || '').trim().toLowerCase();
    const participantCategory = (p.category || p.categoryName || '').trim().toLowerCase();

    // Collect registered competition IDs, clean names, and team IDs for this participant
    const registeredCompIds = new Set<string>();
    const registeredCompNames = new Set<string>();
    const registeredTeamIds = new Set<string>();

    if (p.teamId) registeredTeamIds.add(p.teamId);

    const checkAndAddProgram = (prog: any) => {
      if (!prog) return;
      if (prog.competitionId) registeredCompIds.add(prog.competitionId);
      if (prog.id) registeredCompIds.add(prog.id);
      if (prog.teamId) registeredTeamIds.add(prog.teamId);
      
      const rawProgName = prog.program || prog.name || prog.eventName || '';
      if (rawProgName) {
        const cleanProgName = rawProgName.replace(/\s*\([^)]*Group[^)]*\)/gi, '').trim().toLowerCase();
        registeredCompNames.add(cleanProgName);
        registeredCompNames.add(rawProgName.trim().toLowerCase());
      }
    };

    if (Array.isArray(p.schedule)) p.schedule.forEach(checkAndAddProgram);
    if (Array.isArray(p.registeredPrograms)) p.registeredPrograms.forEach(checkAndAddProgram);
    if (Array.isArray(p.results)) {
      p.results.forEach((r: any) => {
        if (r.competitionId) registeredCompIds.add(r.competitionId);
        if (r.eventName) registeredCompNames.add(r.eventName.trim().toLowerCase());
      });
    }

    const resultsList: any[] = [];
    const seenResultKeys = new Set<string>();

    (allResults || []).forEach((r: any) => {
      const rCompId = r.competitionId || r.raw?.competitionId;
      const rCategory = (r.category || r.categoryName || r.raw?.categoryName || '').trim().toLowerCase();
      const rEventName = (r.eventName || r.program || r.raw?.program || '').trim().toLowerCase();
      const cleanEventName = rEventName.replace(/\s*\([^)]*Group[^)]*\)/gi, '').trim();

      // Check category compatibility to prevent cross-category matches
      if (participantCategory && rCategory && !participantCategory.includes('general') && !rCategory.includes('general')) {
        const sub1 = participantCategory.substring(0, 5);
        const sub2 = rCategory.substring(0, 5);
        if (sub1 !== sub2 && !rCategory.includes(participantCategory) && !participantCategory.includes(rCategory)) {
          return;
        }
      }

      // Extract result participant and team info
      const rPartId = r.participantId || r.raw?.participantId;
      const rCodeNumber = (r.codeNumber || r.chestNumber || r.raw?.codeNumber || r.raw?.chestNumber || '').toString().trim().toLowerCase();
      const rParticipantName = (r.participantName || r.raw?.participantName || '').trim().toLowerCase();
      const rTeamId = r.teamId || r.raw?.teamId;
      const rTeamMemberIds: string[] = r.teamMemberIds || r.raw?.teamMemberIds || [];
      const rDepartment = (r.department || r.unitName || r.raw?.unitName || '').trim().toLowerCase();

      // INDIVIDUAL PARTICIPANT MATCHING
      const isIndividualMatch = Boolean(
        (participantId && rPartId && participantId === rPartId) ||
        (participantCode && rCodeNumber && participantCode === rCodeNumber) ||
        (participantName && rParticipantName && (participantName === rParticipantName || rParticipantName.includes(participantName)))
      );

      // Must be a registered competition for this participant OR a direct individual result match
      const isCompMatch = (
        isIndividualMatch ||
        (rCompId && registeredCompIds.has(rCompId)) ||
        (rEventName && registeredCompNames.has(rEventName)) ||
        (cleanEventName && registeredCompNames.has(cleanEventName))
      );

      if (!isCompMatch) return;

      // GROUP / TEAM MATCHING
      const isGroupEvent = Boolean(
        r.participationType === 'group' ||
        r.participationType === 'Group' ||
        r.participationType === 'Group Event' ||
        r.raw?.participationType === 'group'
      );

      // Category compatibility check
      const isCategoryMatch = !participantCategory || !rCategory || 
        participantCategory === rCategory || 
        rCategory.includes(participantCategory) || 
        participantCategory.includes(rCategory);

      const isGroupMatch = isGroupEvent && Boolean(
        (participantId && rTeamMemberIds.includes(participantId)) ||
        (participantCode && rTeamMemberIds.includes(participantCode)) ||
        (rTeamId && registeredTeamIds.has(rTeamId)) ||
        (participantUnit && rDepartment && participantUnit === rDepartment && (isCompMatch || !rCompId) && isCategoryMatch)
      );

      // A result belongs to this participant if it's their individual result or their matching group team result
      if (isIndividualMatch || (isGroupMatch && (isCompMatch || isCategoryMatch))) {
        const uniqueKey = r.id || `${rCompId}_${r.rank}_${rParticipantName}_${r.program || r.eventName}`;
        if (!seenResultKeys.has(uniqueKey)) {
          seenResultKeys.add(uniqueKey);
          resultsList.push({
            ...r,
            isGroupEvent: isGroupMatch && !isIndividualMatch
          });
        }
      }
    });

    return resultsList;
  }, [allResults, p]);

  // Filter posters where this participant or their group team won Rank 1, 2, or 3 in THEIR exact category & competition
  const participantPosters = useMemo(() => {
    if (!p) return [];

    const wonRanks = participantDeclaredResults.filter(
      r => r.rank === 1 || r.rank === 2 || r.rank === 3
    );

    if (wonRanks.length === 0) return [];

    const wonCompIds = new Set<string>();
    const wonCompKeys = new Set<string>();

    wonRanks.forEach(r => {
      const cId = r.competitionId || r.raw?.competitionId;
      if (cId) wonCompIds.add(cId);

      const cat = (r.category || r.categoryName || r.raw?.categoryName || '').trim().toLowerCase();
      const ev = (r.eventName || r.program || r.raw?.program || '').trim().toLowerCase();
      if (ev && cat) {
        wonCompKeys.add(`${ev}__${cat}`);
      }
    });

    return competitionPosters.filter(poster => {
      const firstRes = poster.results?.[0];
      if (!firstRes) return false;

      const posterCompId = firstRes.competitionId || firstRes.raw?.competitionId;
      if (posterCompId && wonCompIds.has(posterCompId)) return true;

      const posterCat = (poster.category || firstRes.category || '').trim().toLowerCase();
      const posterEv = (poster.eventName || firstRes.eventName || '').trim().toLowerCase();

      if (posterEv && posterCat && wonCompKeys.has(`${posterEv}__${posterCat}`)) {
        return true;
      }

      return false;
    });
  }, [competitionPosters, participantDeclaredResults, p]);

  // Dynamically compute published certificates directly from candidate's declared results (Only Rank 1, 2, 3 where published)
  const participantCertificates = useMemo(() => {
    if (!p) return [];

    return participantDeclaredResults.filter(r => {
      const isPublished = r.certificatePublished || r.raw?.certificatePublished;
      const isTopRank = r.rank >= 1 && r.rank <= 3;
      return isPublished && isTopRank;
    });
  }, [participantDeclaredResults, p]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0F] animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header Full Width */}
      <div className="w-full bg-[#121214] border-b border-white/10 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold shrink-0" style={{ backgroundColor: 'var(--color-primary-accent)' }}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border bg-white/5" style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }}>
                  {p.codeNumber}
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-amber-400" /> Logged In
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide mt-0.5">
                Participant Dashboard & Profile
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={logout}
              style={{ backgroundColor: 'var(--color-primary-accent)', color: '#ffffff' }}
              className="px-5 py-2.5 text-sm font-mono font-bold rounded-xl hover:opacity-90 transition-colors shrink-0 shadow-lg cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={handleClosePortal}
              className="p-2.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto p-6 sm:p-8 space-y-12 shrink-0">

        {/* Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">

          {/* Avatar Column */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <img
                src={p.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name)}`}
                alt={cleanName}
                className="w-36 h-36 rounded-full object-cover shadow-2xl bg-zinc-900 border-2 border-transparent transition-all"
                style={{ borderColor: 'var(--color-primary-accent)' }}
              />
            </div>
            <label className="cursor-pointer text-xs font-bold font-mono uppercase tracking-wider transition-colors hover:underline" style={{ color: 'var(--color-primary-accent)' }}>
              Upload
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          {/* Info Column */}
          <div className="space-y-3 w-full sm:pt-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">{cleanName}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm font-mono">
              <span className="bg-white/10 text-zinc-200 px-3 py-1.5 rounded-xl border border-white/10">
                Team: <strong className="text-sky-400">{deptName}</strong>
              </span>
              <span className="bg-white/5 px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--color-primary-accent)', color: 'var(--color-primary-accent)' }}>
                Category: <strong className="font-extrabold" style={{ color: 'var(--color-primary-accent)' }}>{catName}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-zinc-400">
              <p>
                Chest Number: <strong className="text-white font-mono">{p.codeNumber}</strong>
              </p>
              <p>
                Date of Birth: <strong className="text-white font-mono">{dobFormatted}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Festival Status: <strong className="text-emerald-400">Active Participant</strong></span>
          <span className="text-xs text-zinc-400 font-mono">Verified Credentials</span>
        </div>

        {/* Section A: Registered Programs */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary-accent)' }} />
            <span>Your Registered Programs</span>
          </h4>

          {(!p.schedule || p.schedule.length === 0) ? (
            <div className="bg-black/30 border border-white/10 rounded-3xl p-8 text-center text-sm text-zinc-400 font-mono">
              No registered program
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.schedule.map((sc) => (
                <div key={sc.id} className="bg-black/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-white/20 transition-all">
                  <div className="space-y-1">
                    <h5 className="text-base font-bold text-white">{sc.program}</h5>
                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{sc.category} Category</p>
                  </div>
                  <div>
                    {sc.status === 'live' ? (
                      <span style={{ backgroundColor: 'var(--color-primary-accent)' }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                    ) : (sc.status === 'completed' || sc.status === 'done' || sc.status === 'finished') ? (
                      <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 border border-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-white/10 text-zinc-200 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                        {sc.status ? String(sc.status).toUpperCase() : 'REGISTERED'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section B: Declared Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Declared Results</span>
            </h4>
          </div>

          {participantDeclaredResults.length === 0 ? (
            <div className="bg-black/30 border border-white/10 rounded-3xl p-8 text-center text-sm text-zinc-400 font-mono">
              No results declared yet for your programs.
            </div>
          ) : (
            <div className="space-y-4">
              {participantDeclaredResults.map((res) => {
                const rawMarks = res.averageMark ?? (res.raw ? res.raw.averageMark : undefined) ?? res.totalMark ?? res.marks ?? (res.raw ? (res.raw.totalMark ?? res.raw.judge1Mark) : undefined);
                let computedGrade = res.grade;
                if (rawMarks !== undefined && rawMarks !== null) {
                  const m = Number(rawMarks);
                  if (m >= 90) computedGrade = 'A+';
                  else if (m >= 80) computedGrade = 'A';
                  else if (m >= 70) computedGrade = 'B+';
                  else if (m >= 60) computedGrade = 'B';
                  else if (m >= 50) computedGrade = 'C+';
                  else if (m >= 40) computedGrade = 'C';
                  else if (m >= 30) computedGrade = 'D+';
                  else computedGrade = 'D';
                }

                const isGroup = res.isGroupEvent || res.participationType === 'group' || res.participationType === 'Group Event' || res.participationType === 'Group' || (res.raw && res.raw.participationType === 'group');

                return (
                  <div key={res.id || `res-${Math.random()}`} className="bg-[#18181B] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-md ${
                        res.rank === 1 ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-amber-500/20' :
                        res.rank === 2 ? 'bg-slate-200 text-slate-950 border-2 border-slate-300 shadow-slate-400/20' :
                        res.rank === 3 ? 'bg-amber-700 text-white border-2 border-amber-600 shadow-amber-800/20' :
                        'bg-emerald-600 text-white border-2 border-emerald-500'
                      }`}>
                        {res.rank ? `#${res.rank}` : 'Pass'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-lg font-bold text-white tracking-tight">{res.eventName}</h5>
                          {isGroup && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                              Group / Team
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 font-mono">
                          Grade: <strong className="text-emerald-400">{computedGrade || 'A'}</strong>{rawMarks !== undefined ? <> • Total Marks: <strong className="text-amber-400">{rawMarks} marks</strong></> : null}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center self-start md:self-center">
                      {isGroup ? 'Group Team Event' : 'Individual Event'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section C: Official Certificates */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Official Certificates</span>
          </h4>

          {participantCertificates.length === 0 ? (
            <div className="bg-black/30 border border-white/10 rounded-3xl p-8 text-center text-sm text-zinc-400 font-mono">
              No certificates available yet. (Certificates are awarded for Rank 1, 2, and 3 after admin verification).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participantCertificates.map((res) => {
                return (
                  <div key={`cert-${res.id}`} className="bg-black/50 border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all">
                    <div>
                      <h5 className="text-base font-bold text-white">{res.eventName}</h5>
                      <p className="text-xs text-emerald-400 font-mono uppercase mt-1 font-bold">Rank #{res.rank} Official Certificate</p>
                    </div>
                    
                    <div className="flex-1 min-h-[150px] relative rounded-xl overflow-hidden border border-white/5 bg-black/50">
                      <CertificateImage 
                        participantName={cleanName}
                        competitionName={res.eventName}
                        competitionId={res.competitionId}
                        rank={res.rank || 1}
                        className="w-full h-full object-contain"
                        onLoadUrl={(url) => {
                          const imgEl = document.getElementById(`cert-img-data-${res.id}`) as HTMLImageElement;
                          if (imgEl) imgEl.src = url;
                        }}
                      />
                      <img id={`cert-img-data-${res.id}`} style={{ display: 'none' }} alt="data-url" />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          const imgEl = document.getElementById(`cert-img-data-${res.id}`) as HTMLImageElement;
                          if (imgEl && imgEl.src) {
                            const a = document.createElement('a');
                            a.href = imgEl.src;
                            a.download = `Certificate_${res.eventName.replace(/\s+/g, '_')}_${cleanName.replace(/\s+/g, '_')}.jpg`;
                            a.click();
                          } else {
                            alert("Please wait for certificate to load");
                          }
                        }}
                        className="flex-1 px-3 py-2.5 bg-white/10 hover:bg-emerald-500 hover:text-black text-white text-xs font-mono font-bold rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button
                        onClick={() => {
                          const imgEl = document.getElementById(`cert-img-data-${res.id}`) as HTMLImageElement;
                          if (imgEl && imgEl.src) {
                            handleShare('Official Certificate', `Rank ${res.rank} Certificate for ${res.eventName}`, imgEl.src);
                          }
                        }}
                        className="flex-1 px-3 py-2.5 bg-white/10 hover:bg-emerald-500 hover:text-black text-white text-xs font-mono font-bold rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Share
                      </button>
                      <button
                        onClick={() => {
                          const imgEl = document.getElementById(`cert-img-data-${res.id}`) as HTMLImageElement;
                          if (imgEl && imgEl.src) handlePrint(imgEl.src);
                        }}
                        className="flex-1 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-900/40"
                      >
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section D: Official Winner Posters */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Official Winner Posters</span>
          </h4>

          {participantPosters.length === 0 ? (
            <div className="bg-black/30 border border-white/10 rounded-3xl p-8 text-center text-sm text-zinc-400 font-mono">
              No winner posters available yet. (Winner posters are generated for Rank 1, 2, and 3).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participantPosters.map((poster) => {
                return (
                  <div key={`poster-${poster.id}`} className="bg-black/50 border border-white/10 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all">
                    <div>
                      <h5 className="text-base font-bold text-white">{poster.eventName}</h5>
                      <p className="text-xs text-purple-400 font-mono uppercase mt-1 font-bold">
                        {poster.category} • Result {poster.compIndex < 10 ? `0${poster.compIndex}` : poster.compIndex}
                      </p>
                    </div>
                    
                    <div className="flex-1 min-h-[220px] relative rounded-xl overflow-hidden border border-white/5 bg-black/50">
                      <PosterImage 
                        competitionId={poster.id}
                        eventName={poster.eventName}
                        category={poster.category}
                        compIndex={poster.compIndex}
                        results={poster.results}
                        className="w-full h-full object-contain"
                        onLoadUrl={(url) => {
                          const imgEl = document.getElementById(`poster-img-data-${poster.id}`) as HTMLImageElement;
                          if (imgEl) imgEl.src = url;
                        }}
                      />
                      <img id={`poster-img-data-${poster.id}`} style={{ display: 'none' }} alt="data-url" />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          const imgEl = document.getElementById(`poster-img-data-${poster.id}`) as HTMLImageElement;
                          if (imgEl && imgEl.src) {
                            const a = document.createElement('a');
                            a.href = imgEl.src;
                            a.download = `Result_Poster_${poster.category}_${poster.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                            a.click();
                          } else {
                            alert("Please wait for poster to load");
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-purple-500 hover:text-white text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button
                        onClick={() => {
                          const imgEl = document.getElementById(`poster-img-data-${poster.id}`) as HTMLImageElement;
                          if (imgEl && imgEl.src) {
                            handleShare('Result Poster', `Winner Poster for ${poster.eventName}`, imgEl.src);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-purple-500 hover:text-white text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer info bar Full Width */}
      <div className="w-full border-t border-white/10 shrink-0 text-center mt-auto bg-[#0D0D0F]">
        <div className="max-w-6xl mx-auto p-8">
          <button
            type="button"
            onClick={handleClosePortal}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to the Festival
          </button>
        </div>
      </div>
    </div>
  );
};
