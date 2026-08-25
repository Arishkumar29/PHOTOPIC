import { useState, useEffect } from 'react';
import { Search, Trash2, Calendar, Folder, Users, Copy, CheckCircle, ExternalLink, SlidersHorizontal, Plus, Image as ImageIcon, Share2, UserPlus, X, MapPin, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';

export function MyEvents({ onSelectEvent, onCreateEventClick }) {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [copiedId, setCopiedId] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [collabEvent, setCollabEvent] = useState(null);
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [collabSuccess, setCollabSuccess] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) { console.error(e); }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to permanently delete this event gallery?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) setEvents(events.filter(e => e.eventId !== eventId));
    } catch (e) { console.error(e); }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCollaborator = (e) => {
    e.preventDefault();
    if (!newCollabEmail.trim()) return;
    setCollabSuccess(true);
    setNewCollabEmail('');
    setTimeout(() => setCollabSuccess(false), 3000);
  };

  const formatDate = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return 'Jun 15, 2026'; }
  };

  const filteredEvents = events
    .filter(e => {
      const s = e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || e.orgName.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeSubTab === 'All') return s;
      if (activeSubTab === 'Live') return s && e.folderId !== 'local_upload';
      if (activeSubTab === 'Draft') return s && e.folderId === 'local_upload';
      if (activeSubTab === 'Expired') return false;
      return s;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return b.eventId.localeCompare(a.eventId);
      if (sortBy === 'Name') return a.eventName.localeCompare(b.eventName);
      return 0;
    });

  const subTabs = ['All', 'Live', 'Draft', 'Expired'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2 }}
      className="space-y-8 text-left font-sans text-slate-900 dark:text-zinc-50"
    >
      {/* ─── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-2">
            Gallery Manager
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.05]">
            My <span className="font-serif italic text-slate-400 dark:text-zinc-500">Events.</span>
          </h1>
        </div>
        <button
          onClick={onCreateEventClick}
          className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-7 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* ─── TOOLBAR: SEARCH + SORT + TABS ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-100 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 border-2 font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors"
              placeholder="Search events…"
            />
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-zinc-900/40 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl pl-11 pr-8 py-3 text-sm font-medium text-slate-900 dark:text-zinc-50 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 cursor-pointer transition-colors"
            >
              <option value="Newest">Newest first</option>
              <option value="Name">By name</option>
            </select>
          </div>
        </div>

        {/* Sub-tabs — editorial border-b underline style */}
        <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800/60 overflow-x-auto scrollbar-none">
          {subTabs.map(tab => {
            const isActive = activeSubTab === tab;
            const counts = {
              All: events.length,
              Live: events.filter(e => e.folderId !== 'local_upload').length,
              Draft: events.filter(e => e.folderId === 'local_upload').length,
              Expired: 0,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`relative px-4 py-2.5 text-sm font-medium tracking-tight shrink-0 transition-all -mb-px border-b-2 ${
                  isActive
                    ? 'text-slate-900 dark:text-zinc-50 border-slate-900 dark:border-zinc-100'
                    : 'text-slate-400 dark:text-zinc-500 border-transparent hover:opacity-60'
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
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
            className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[2.5rem] p-16 text-center max-w-lg mx-auto"
          >
            <div className="w-16 h-16 bg-white dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6">
              <Folder className="w-7 h-7 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 mb-2">
              No <span className="font-serif italic text-slate-400">galleries</span> found
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-8 leading-relaxed">
              {searchTerm ? `No results for "${searchTerm}"` : 'Create your first facial scan gallery to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateEventClick}
                className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                Create First Event
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((e, i) => {
              const guestLink = `${window.location.origin}/?event=${e.eventId}`;
              const isDraft = e.folderId === 'local_upload';

              return (
                <motion.div
                  layout
                  key={e.eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', bounce: 0.2, delay: i * 0.05 }}
                  className="group bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[1.75rem] overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Cover image */}
                  <div className="relative h-44 bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    {e.coverImage ? (
                      <img
                        src={e.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-7 h-7 text-slate-400 dark:text-zinc-600" />
                        <span className="text-xs font-medium text-slate-400 dark:text-zinc-600">No cover image</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                      isDraft
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white/90 text-slate-900 border-white/60'
                    }`}>
                      {isDraft ? 'Draft' : 'Live'}
                    </span>

                    {/* Photo count pill — top right */}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20 backdrop-blur-sm">
                      {e.photos?.length || 0} photos
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-base font-medium tracking-tight text-slate-900 dark:text-zinc-50 truncate group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors">
                        {e.eventName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(e.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> 12 views
                        </span>
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/40">
                      {/* Primary Manage button */}
                      <button
                        onClick={() => onSelectEvent(e)}
                        className="flex-1 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-2.5 rounded-full transition-all text-xs text-center shadow-sm hover:shadow-md"
                      >
                        Manage
                      </button>

                      {/* Icon actions — soft rounded buttons */}
                      <button
                        onClick={() => setShareEvent(e)}
                        className="p-2.5 bg-white dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded-full transition-all border border-slate-100 dark:border-zinc-700/60"
                        title="Share Gallery"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCollabEvent(e)}
                        className="p-2.5 bg-white dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded-full transition-all border border-slate-100 dark:border-zinc-700/60"
                        title="Add Collaborators"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(e.eventId)}
                        className="p-2.5 bg-white dark:bg-zinc-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-full transition-all border border-slate-100 dark:border-zinc-700/60"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SHARE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {shareEvent && (
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareEvent(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-100 dark:border-zinc-800/60 w-full max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl relative space-y-6"
            >
              {/* Close */}
              <button
                onClick={() => setShareEvent(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-zinc-800 hover:opacity-60 transition-opacity rounded-full text-slate-500 dark:text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Heading */}
              <div>
                <h4 className="text-xl font-medium tracking-tight text-slate-900 dark:text-zinc-50">Share gallery</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">Guests scan QR to find their face-matched photos</p>
              </div>

              {/* QR on neutral bg */}
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 rounded-[1.5rem] p-6 flex justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
                  <QRCode value={`${window.location.origin}/?event=${shareEvent.eventId}`} size={150} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                </div>
              </div>

              {/* Link input + copy */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?event=${shareEvent.eventId}`}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 font-medium focus:outline-none"
                />
                <button
                  onClick={() => copyLink(`${window.location.origin}/?event=${shareEvent.eventId}`, 'modal_share')}
                  className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl text-slate-700 dark:text-zinc-200 transition-colors shrink-0"
                >
                  {copiedId === 'modal_share' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Launch button */}
              <a
                href={`${window.location.origin}/?event=${shareEvent.eventId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
              >
                Launch Gallery <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── COLLABORATORS MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {collabEvent && (
          <motion.div
            key="collab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollabEvent(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-100 dark:border-zinc-800/60 w-full max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl relative space-y-6"
            >
              {/* Close */}
              <button
                onClick={() => setCollabEvent(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-zinc-800 hover:opacity-60 transition-opacity rounded-full text-slate-500 dark:text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Heading */}
              <div>
                <h4 className="text-xl font-medium tracking-tight text-slate-900 dark:text-zinc-50">Add collaborators</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">Invite photographers or clients to this event gallery</p>
              </div>

              {/* Mock collaborator avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[20, 21, 22].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden bg-slate-200">
                      <img src={`https://i.pravatar.cc/80?img=${n}`} className="w-full h-full object-cover grayscale" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">3 collaborators</p>
              </div>

              {/* Email input + submit */}
              <form onSubmit={handleAddCollaborator} className="space-y-3">
                <input
                  type="email"
                  required
                  value={newCollabEmail}
                  onChange={e => setNewCollabEmail(e.target.value)}
                  placeholder="collaborator@email.com"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800/60 border-2 border-slate-200 dark:border-zinc-700/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  Send Invite
                </button>
              </form>

              {/* Success state */}
              <AnimatePresence>
                {collabSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-2xl text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Invite sent successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
