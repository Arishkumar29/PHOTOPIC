import { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Folder, Copy, CheckCircle, ExternalLink, SlidersHorizontal, Image as ImageIcon, QrCode, Camera, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';

export function MyEvents({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const sortRef = useRef(null);

  useEffect(() => { 
    fetchEvents(); 
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortDropdownOpen]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) { 
      console.error(e); 
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { 
      return 'Jun 15, 2026'; 
    }
  };

  const filteredEvents = events
    .filter(e => {
      const s = e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || e.orgName.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeSubTab === 'All') return s;
      if (activeSubTab === 'Live') return s && e.folderId !== 'local_upload';
      if (activeSubTab === 'Draft') return s && e.folderId === 'local_upload';
      return s;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return b.eventId.localeCompare(a.eventId);
      if (sortBy === 'Oldest') return a.eventId.localeCompare(b.eventId);
      if (sortBy === 'Name') return a.eventName.localeCompare(b.eventName);
      return 0;
    });

  const sortOptions = [
    { value: 'Newest', label: 'Newest first' },
    { value: 'Oldest', label: 'Oldest first' },
    { value: 'Name', label: 'By name (A–Z)' }
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Newest first';

  const subTabs = ['All', 'Live', 'Draft'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2 }}
      className="space-y-8 text-left font-sans text-slate-900 dark:text-zinc-50"
    >
      {/* ─── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6e2b8b] dark:text-[#da7756] mb-2">
            Event Galleries
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
            My <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756]">Events.</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-1">
            Select an event to launch the selfie finder or view its guest QR code.
          </p>
        </div>
      </div>

      {/* ─── TOOLBAR: SEARCH + SORT + TABS ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#6e2b8b] transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors shadow-sm"
              placeholder="Search event galleries…"
            />
          </div>

          {/* Custom Sort Dropdown */}
          <div className="relative shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-zinc-100 shadow-sm transition-all cursor-pointer select-none"
              aria-expanded={sortDropdownOpen}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#6e2b8b] dark:text-[#da7756]" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xl shadow-purple-950/5 p-1.5 z-40 space-y-0.5"
                >
                  {sortOptions.map(option => {
                    const isSelected = sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-[#6e2b8b] dark:text-[#da7756]'
                            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#6e2b8b] dark:text-[#da7756]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800/60 overflow-x-auto scrollbar-none">
          {subTabs.map(tab => {
            const isActive = activeSubTab === tab;
            const counts = {
              All: events.length,
              Live: events.filter(e => e.folderId !== 'local_upload').length,
              Draft: events.filter(e => e.folderId === 'local_upload').length,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`relative px-4 py-2.5 text-sm font-semibold tracking-tight shrink-0 transition-all -mb-px border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-[#6e2b8b] dark:text-[#da7756] border-[#6e2b8b] dark:border-[#da7756]'
                    : 'text-slate-400 dark:text-zinc-500 border-transparent hover:opacity-60'
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span className={`ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6e2b8b] dark:text-[#da7756]' 
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── EVENT GRID ──────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredEvents.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 rounded-[2.5rem] p-16 text-center max-w-lg mx-auto shadow-sm"
          >
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Folder className="w-7 h-7 text-[#6e2b8b] dark:text-[#da7756]" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-2">
              No galleries found
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm leading-relaxed">
              {searchTerm ? `No results for "${searchTerm}"` : 'No event galleries available yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((e, i) => {
              const isDraft = e.folderId === 'local_upload';

              return (
                <motion.div
                  layout
                  key={e.eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', bounce: 0.2, delay: i * 0.05 }}
                  className="group bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                >
                  {/* Cover image */}
                  <div 
                    onClick={() => onSelectEvent(e)}
                    className="relative h-44 bg-slate-100 dark:bg-zinc-800 overflow-hidden cursor-pointer"
                  >
                    {e.coverImage ? (
                      <img
                        src={e.coverImage}
                        alt={e.eventName}
                        className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-7 h-7 text-slate-400 dark:text-zinc-600" />
                        <span className="text-xs font-medium text-slate-400 dark:text-zinc-600">Event Gallery</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#da7756]" /> Open Selfie Finder
                      </span>
                    </div>

                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                      isDraft
                        ? 'bg-black/40 text-white border-white/20'
                        : 'bg-white/90 text-slate-900 border-white/60'
                    }`}>
                      {isDraft ? 'Draft' : 'Live'}
                    </span>

                    {/* Photo count pill */}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-sm">
                      {e.photos?.length || 0} photos
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 
                        onClick={() => onSelectEvent(e)}
                        className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50 truncate cursor-pointer hover:text-[#6e2b8b] dark:hover:text-[#da7756] transition-colors"
                      >
                        {e.eventName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(e.createdAt)}
                        </span>
                        <span>by {e.orgName || 'Organizer'}</span>
                      </div>
                    </div>

                    {/* User Action buttons: Direct Selfie Page & QR Code */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/40">
                      {/* 1. Open Selfie Page */}
                      <button
                        onClick={() => onSelectEvent(e)}
                        className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Selfie Page</span>
                      </button>

                      {/* 2. Show QR Code Modal */}
                      <button
                        onClick={() => setQrModalEvent(e)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#6e2b8b] dark:text-[#da7756]" />
                        <span>Show QR</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EVENT QR CODE MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {qrModalEvent && (
          <motion.div
            key="qr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrModalEvent(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-sm p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative space-y-6 text-center"
            >
              {/* Heading */}
              <div>
                <h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                  {qrModalEvent.eventName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                  Scan QR code with any phone camera to find face-matched photos
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-purple-50/50 dark:bg-zinc-800/60 border border-purple-100 dark:border-zinc-700/60 rounded-[2rem] p-6 flex justify-center shadow-inner">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
                  <QRCode 
                    value={`${window.location.origin}/?event=${qrModalEvent.eventId}`} 
                    size={160} 
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }} 
                  />
                </div>
              </div>

              {/* Link input + copy button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?event=${qrModalEvent.eventId}`}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-700 dark:text-zinc-300 font-medium focus:outline-none select-all"
                />
                <button
                  onClick={() => copyLink(`${window.location.origin}/?event=${qrModalEvent.eventId}`, 'modal_qr')}
                  className="p-3 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white rounded-xl transition-opacity hover:opacity-90 shrink-0 cursor-pointer shadow-sm"
                  title="Copy Guest Link"
                >
                  {copiedId === 'modal_qr' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Direct Open Selfie Page button */}
              <button
                onClick={() => {
                  const ev = qrModalEvent;
                  setQrModalEvent(null);
                  onSelectEvent(ev);
                }}
                className="w-full bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-purple-950/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Selfie Page</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
