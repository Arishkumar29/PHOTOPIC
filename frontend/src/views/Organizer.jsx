import { useState, useEffect, useRef } from 'react';
import { Home, FolderHeart, PlusCircle, QrCode, BarChart3, Settings, LogOut, ArrowRight, CheckCircle2, Link as LinkIcon, Building2, Calendar, Copy, Loader2, Sparkles, UploadCloud, Trash2, Sparkle, Image as ImageIcon, Eye, Users, ChevronRight, Download, Edit, AlertCircle, MapPin, AlignLeft, CalendarRange, Share2, EyeOff, Film, Lock, ShieldCheck, Camera, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { googleSignIn } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

const PRESET_COVERS = [
  { id: 'celebration', name: 'Celebration', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80' },
  { id: 'corporate', name: 'Corporate', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80' },
  { id: 'festival', name: 'Festival', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&auto=format&fit=crop&q=80' },
  { id: 'travel', name: 'Outdoor', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=80' },
];

// CountUp component for stats
function CountUp({ end, duration = 1 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Custom Area / Line Chart for Analytics Graph using real backend data
function CustomAreaChart({ timeline }) {
  const height = 240;
  const width = 640;
  const padding = 40;

  const dates = timeline?.labels || [];
  const values = timeline?.data || [];

  // Determine dynamic scale range
  const maxVal = Math.max(...values, 10) * 1.1;
  const roundedMax = Math.ceil(maxVal / 10) * 10;
  const gridLines = [
    roundedMax,
    Math.round(roundedMax * 0.8),
    Math.round(roundedMax * 0.6),
    Math.round(roundedMax * 0.4),
    Math.round(roundedMax * 0.2),
    0
  ];

  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const getY = (val) => {
    const norm = val / roundedMax;
    return height - padding - norm * chartHeight;
  };

  const getX = (idx) => {
    if (dates.length <= 1) return padding + chartWidth / 2;
    return padding + (idx / (dates.length - 1)) * chartWidth;
  };

  const points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const pathD = points.length > 0 ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}` : '';
  
  // Area closed path for gradient fill
  const areaD = points.length > 0 ? `${pathD} L ${getX(dates.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z` : '';

  return (
    <div className="w-full overflow-x-auto scrollbar-none bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 p-6 rounded-[2rem] shadow-sm relative">
      <div className="min-w-[600px] relative">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="areaNeutralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" className="text-slate-900 dark:text-zinc-100" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-slate-900 dark:text-zinc-100" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  className="stroke-slate-100 dark:stroke-zinc-800/40" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 12} 
                  y={y + 3.5} 
                  textAnchor="end" 
                  className="text-[10px] font-semibold fill-slate-400 dark:fill-zinc-500 font-sans"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Dates */}
          {dates.map((date, idx) => {
            const x = getX(idx);
            return (
              <text 
                key={date}
                x={x}
                y={height - padding + 22}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-400 dark:fill-zinc-500 font-sans"
              >
                {date}
              </text>
            );
          })}

          {/* Area under the curve */}
          <motion.path 
            d={areaD}
            fill="url(#areaNeutralGrad)"
            className="text-slate-900 dark:text-zinc-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.5 }}
          />

          {/* Path Line */}
          <motion.path 
            d={pathD}
            fill="none"
            stroke="currentColor"
            className="text-slate-950 dark:text-zinc-50"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Nodes */}
          {points.map((p, idx) => (
            <motion.circle 
              key={idx}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="currentColor"
              className="text-slate-950 dark:text-zinc-50 stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            />
          ))}

        </svg>
      </div>
    </div>
  );
}

export function Organizer({ initialView = 'dashboard', onOpenPublicView }) {
  const { user } = useAuth();
  
  // Dashboard states
  const [viewMode, setViewMode] = useState(initialView);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [startDate, setStartDate] = useState('2026-07-04');
  const [endDate, setEndDate] = useState('2026-07-04');
  const [eventType, setEventType] = useState('Wedding');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [folderLink, setFolderLink] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [eventId, setEventId] = useState('');
  
  // Field errors
  const [errors, setErrors] = useState({});
  const wizardFileRef = useRef(null);

  // Analytics sub-tabs
  const [analyticsSubTab, setAnalyticsSubTab] = useState('Analytics');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30'); // '7', '30', '90'
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState('Month'); // 'Day', 'Week', 'Month'
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showGroupByDropdown, setShowGroupByDropdown] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    visits: 0,
    views: 0,
    downloads: 0,
    faceScans: 0,
    timeline: { labels: [], data: [] }
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/analytics?period=${analyticsPeriod}`);
      const data = await res.json();
      setAnalyticsData(data);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'analytics') {
      fetchAnalytics();
    }
  }, [viewMode, analyticsPeriod]);

  useEffect(() => {
    setViewMode(initialView);
    fetchEvents();
  }, [initialView]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event gallery permanently?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.eventId !== id));
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep1 = () => {
    const errs = {};
    if (!eventName.trim()) errs.eventName = "Event name is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleDriveSync = async () => {
    if (!folderLink) return;
    setIsSyncing(true);
    try {
      const authResult = await googleSignIn();
      if (!authResult) throw new Error("Google Authentication failed");
      
      const match = folderLink.match(/folders\/([a-zA-Z0-9-_]+)/);
      const folderId = match ? match[1] : folderLink;
      const newEventId = "evt_" + Math.random().toString(36).substring(2, 9);
      
      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: newEventId,
          folderId,
          accessToken: authResult.accessToken,
          orgName: orgName || user?.displayName || 'Privapic host',
          eventName: eventName,
          coverImage: coverImage
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to register sync event");
      }
      
      setEventId(newEventId);
      setStep(3);
      fetchEvents();
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      console.error(err);
      alert(err.message || "Failed to sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const totalPhotosSynced = events.reduce((sum, e) => sum + (e.photos?.length || 0), 0);
  const globalQRLink = events.length > 0 ? `${window.location.origin}/?event=${events[0].eventId}` : window.location.origin;
  const publicLink = eventId ? `${window.location.origin}/?event=${eventId}` : '';

  return (
    <div className="w-full text-slate-900 dark:text-zinc-50 font-sans text-left">

      <AnimatePresence mode="wait">
        
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Welcome banner — matches landing page dark panel (Features section style) */}
            <div className="bg-slate-900 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-800 dark:border-zinc-800/60 text-white rounded-[1.75rem] sm:rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden">
              {/* Scattered icon background — matches lime CTA band */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-8 grid-rows-3 gap-8 opacity-[0.06] p-8">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="w-8 h-8 flex items-center justify-center">
                    {i % 3 === 0 ? <Camera className="w-full h-full text-white"/> : i % 3 === 1 ? <Zap className="w-full h-full text-white"/> : <Lock className="w-full h-full text-white"/>}
                  </div>
                ))}
              </div>
              <div className="relative z-10 max-w-xl">
                <div className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">Organizer Dashboard</div>
                <h2 className="text-3xl sm:text-5xl font-medium tracking-tight leading-[1.05] text-white mb-4">
                  Welcome back, <span className="font-serif italic text-slate-400">{user?.displayName || 'photographer'}.</span>
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Upload galleries to Google Drive, index photos with neural FaceSync, and share with guests.
                </p>
              </div>
            </div>

            {/* Stats grid — large rounded cards, font-medium labels */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Events', val: events.length },
                { label: 'Photos Synced', val: totalPhotosSynced },
                { label: 'Guests Reached', val: events.length * 14 },
                { label: 'Downloads', val: events.length * 28 },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                  className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 p-6 rounded-[1.75rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg transition-shadow"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">{stat.label}</span>
                  <span className="text-3xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 mt-2">
                    <CountUp end={stat.val} />
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Workflow strip — lime CTA band style */}
            <div className="bg-[#c0ff00] rounded-[1.75rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none grid grid-cols-8 grid-rows-2 gap-6 opacity-10 p-6">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-6 h-6 flex items-center justify-center">
                    {i % 2 === 0 ? <Camera className="w-full h-full text-black"/> : <Zap className="w-full h-full text-black"/>}
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <h4 className="text-lg sm:text-xl font-medium tracking-tight text-black">The Privapic Workflow</h4>
                <p className="text-sm font-medium text-black/70 mt-1">Create Gallery → Connect Drive → Guests scan to find photos via AI FaceSync</p>
              </div>
              <button 
                onClick={() => setViewMode('create')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl shrink-0 relative z-10 whitespace-nowrap"
              >
                Create Gallery
              </button>
            </div>

            {/* Recent galleries — rounded-[1.75rem] cards matching LandingPage card style */}
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-medium tracking-tight">Recent Galleries</h3>
                <button 
                  onClick={() => setViewMode('create')}
                  className="text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity"
                >
                  + Create new
                </button>
              </div>
              
              {events.length === 0 ? (
                <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[1.75rem] p-12 text-center">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 mb-2">No galleries yet</h4>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Create your first event gallery to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {events.slice(0, 3).map((e, i) => (
                    <motion.div
                      key={e.eventId}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ type: 'spring', bounce: 0.2, delay: i * 0.08 }}
                      className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[1.75rem] overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
                    >
                      <div className="h-36 relative bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                        {e.coverImage ? (
                          <img src={e.coverImage} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <span className="absolute top-3 left-3 text-[9px] bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur font-bold px-2 py-0.5 rounded-full border border-slate-100 dark:border-zinc-800 uppercase">
                          {e.folderId === 'local_upload' ? 'Draft' : 'Live'}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-medium text-base tracking-tight truncate text-slate-900 dark:text-zinc-50">{e.eventName}</h5>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{e.orgName}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/40">
                          <button 
                            onClick={() => onOpenPublicView(e)}
                            className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity"
                          >
                            Preview
                          </button>
                          <button 
                            onClick={() => deleteEvent(e.eventId)}
                            className="text-xs font-semibold text-red-500 hover:opacity-60 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {viewMode === 'create' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[2.5rem] p-6 sm:p-8 md:p-10 relative overflow-hidden min-h-[580px] flex flex-col justify-between"
          >
            {/* Editorial step indicator — large typographic numbers with thin connecting lines */}
            <div className="flex justify-center items-center gap-6 sm:gap-10 mb-10 pb-6 border-b border-slate-200/60 dark:border-zinc-800/40 shrink-0">
              {[
                { n: 1, label: 'Event Details' },
                { n: 2, label: 'Connect Drive' },
                { n: 3, label: 'Review & Publish' },
              ].map((s, idx) => (
                <>
                  {idx > 0 && <div key={`line-${idx}`} className="w-8 sm:w-14 h-px bg-slate-200 dark:bg-zinc-800 shrink-0" />}
                  <div key={s.n} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step >= s.n
                        ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                    }`}>{s.n}</div>
                    <span className={`text-xs font-medium tracking-tight hidden sm:block ${
                      step >= s.n ? 'text-slate-900 dark:text-zinc-50' : 'text-slate-400 dark:text-zinc-500'
                    }`}>{s.label}</span>
                  </div>
                </>
              ))}
            </div>

            <div className="flex-1 pb-20">
              <AnimatePresence mode="wait">
                 {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start"
                  >
                    {/* === LEFT: FORM INPUTS === */}
                    <div className="lg:col-span-3 space-y-6 text-left">

                      {/* Event Name — large editorial input */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Event Name</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={eventName}
                            onChange={e => { setEventName(e.target.value); setErrors({...errors, eventName: null}); }}
                            className={`w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 rounded-2xl focus:outline-none focus:ring-0 font-medium text-base text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors ${
                              errors.eventName
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-slate-200 dark:border-zinc-800/60 focus:border-slate-900 dark:focus:border-zinc-100'
                            }`}
                            placeholder="e.g. Wedding 2026"
                          />
                          {errors.eventName && <AlertCircle className="absolute right-4 top-4 text-red-400 w-5 h-5" />}
                        </div>
                        {errors.eventName && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.eventName}</p>}
                      </div>

                      {/* Dates row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Start Date</label>
                          <input 
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">End Date</label>
                          <input 
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Type & Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Event Type</label>
                          <select
                            value={eventType}
                            onChange={e => setEventType(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 cursor-pointer transition-colors"
                          >
                            {['Wedding', 'Corporate', 'Concert', 'School', 'Sports', 'Other'].map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Location <span className="normal-case text-slate-400">(optional)</span></label>
                          <input 
                            type="text"
                            value={eventLocation}
                            onChange={e => setEventLocation(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors"
                            placeholder="City, Venue"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Description <span className="normal-case text-slate-400">(optional)</span></label>
                        <textarea 
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          rows={2}
                          className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-none transition-colors"
                          placeholder="A brief description of this event…"
                        />
                      </div>

                      {/* Cover Page selector — matching LandingPage card radius */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">Gallery Cover Page</label>
                          <button 
                            onClick={() => wizardFileRef.current?.click()}
                            className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Upload Custom
                          </button>
                          <input type="file" ref={wizardFileRef} onChange={handleCustomCoverUpload} accept="image/*" className="hidden" />
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                          {PRESET_COVERS.map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => setCoverImage(preset.url)}
                              className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.03] ${
                                coverImage === preset.url
                                  ? 'border-slate-900 dark:border-zinc-100 scale-[1.03] shadow-lg'
                                  : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
                              }`}
                            >
                              <img src={preset.url} className="w-full h-full object-cover" />
                              {coverImage === preset.url && (
                                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                              )}
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                <p className="text-white text-[9px] font-semibold text-center">{preset.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* === RIGHT: LIVE PREVIEW CARD — dark panel matching Features section === */}
                    <div className="lg:col-span-2">
                      <div className="bg-slate-900 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-800 dark:border-zinc-800/60 text-white rounded-[1.75rem] overflow-hidden shadow-xl relative">
                        {/* Cover image with gradient */}
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={coverImage} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                          {/* Floating type badge */}
                          <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/20">
                            {eventType}
                          </div>
                          {/* Username pill */}
                          <div className="absolute top-3 right-3 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                            @{user?.displayName?.split(' ')[0]?.toLowerCase() || 'organizer'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div>
                            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">Gallery Preview</div>
                            <h4 className="text-xl font-medium tracking-tight text-white leading-tight">
                              {eventName || <span className="text-slate-500 italic">Untitled Event</span>}
                            </h4>
                          </div>

                          {/* Location & date row */}
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                            {eventLocation && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {eventLocation}
                              </span>
                            )}
                            {startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {startDate}
                              </span>
                            )}
                          </div>

                          {/* Mini avatar grid — like landing Faces Grid */}
                          <div className="flex gap-1.5 pt-1">
                            {[10, 12, 14, 16, 18].map((n) => (
                              <div key={n} className="w-7 h-7 rounded-full overflow-hidden border-2 border-slate-800">
                                <img src={`https://i.pravatar.cc/80?img=${n}`} className="w-full h-full object-cover grayscale" />
                              </div>
                            ))}
                            <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">+</div>
                          </div>

                          {/* Step indicator line */}
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex gap-1.5">
                              {[1,2,3].map(n => (
                                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= 1 ? 'bg-white' : 'bg-white/20'}`} />
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-2">Step 1 of 3 — Event Details</p>
                          </div>
                        </div>
                      </div>

                      {/* Tip box */}
                      <div className="mt-3 bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-2xl p-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100">Tip:</span> A strong cover photo and clear event name help guests identify their gallery instantly.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}


                {step === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="max-w-2xl mx-auto space-y-8 text-left"
                  >
                    {/* Step 2 hero heading */}
                    <div>
                      <div className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-3">Step 2 of 3</div>
                      <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 leading-[1.05] mb-3">
                        Connect your <span className="font-serif italic text-slate-400 dark:text-zinc-500">Drive.</span>
                      </h2>
                      <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                        Link a shared Google Drive folder and we’ll sync all photos automatically for face-recognition matching.
                      </p>
                    </div>

                    {/* 3-step visual instruction cards — like landing page gateway cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { n: '01', title: 'Open Drive', body: 'Go to drive.google.com and create or open a folder with your event photos.' },
                        { n: '02', title: 'Share Folder', body: 'Right-click the folder → Share → set link access to “Anyone with link can view”.' },
                        { n: '03', title: 'Paste Link', body: 'Copy the folder link and paste it in the field below to connect your gallery.' },
                      ].map((card) => (
                        <div key={card.n} className="bg-slate-900 dark:bg-zinc-900/60 border border-slate-800 dark:border-zinc-800/60 rounded-[1.5rem] p-5 text-white">
                          <div className="text-2xl font-medium tracking-tight text-slate-500 mb-3">{card.n}</div>
                          <h4 className="font-medium text-base mb-1.5">{card.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">{card.body}</p>
                        </div>
                      ))}
                    </div>

                    {/* Drive link input */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Google Drive Folder Link</label>
                      <input 
                        type="text"
                        value={folderLink}
                        onChange={e => setFolderLink(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-zinc-900/60 border-2 border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors"
                        placeholder="https://drive.google.com/drive/folders/…"
                      />
                    </div>

                    {/* Syncing state — neutral panel, no yellow */}
                    {isSyncing && (
                      <div className="p-5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                          <Loader2 className="w-5 h-5 text-white dark:text-zinc-900 animate-spin" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-zinc-50 block">Syncing Drive folder…</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Contacting Google Workspace API</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.3 }}
                    className="space-y-6 max-w-xl mx-auto py-4"
                  >
                    {/* Orange full-bleed QR reveal card — matches gateway section style */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.3, delay: 0.1 }}
                      className="relative w-full rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden bg-[#ff5e3a] p-8 sm:p-12 text-white text-center"
                    >
                      {/* Scattered icon background */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-4 gap-6 opacity-[0.12] p-6">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className="flex items-center justify-center">
                            {i % 2 === 0 ? <Camera className="w-full h-full text-white"/> : <Lock className="w-full h-full text-white"/>}
                          </div>
                        ))}
                      </div>

                      {/* Check icon */}
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                        className="w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30"
                      >
                        <CheckCircle2 className="w-7 h-7" />
                      </motion.div>

                      <h3 className="text-3xl sm:text-4xl font-medium tracking-tight mb-2 relative z-10">Gallery is Live!</h3>
                      <p className="text-white/80 font-medium text-sm relative z-10 mb-8">Your guests scan this QR code to access their face-matched photos.</p>

                      {/* QR code on white bg */}
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="bg-white p-4 rounded-2xl shadow-2xl inline-block mx-auto relative z-10"
                      >
                        <QRCode value={publicLink} size={150} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                      </motion.div>
                    </motion.div>

                    {/* Link copy row */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={publicLink}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/40 rounded-2xl text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none"
                      />
                      <button 
                        onClick={() => copyLink(publicLink, 'wizard_pub')}
                        className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl text-slate-700 dark:text-zinc-200 transition-colors shrink-0" 
                      >
                        {copiedId === 'wizard_pub' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Action buttons — rounded-full pills */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => onOpenPublicView({ eventName, eventId })}
                        className="flex-1 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
                      >
                        Launch Experience <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('dashboard')}
                        className="px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-full transition-all text-sm"
                      >
                        Dashboard
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Wizard footer — rounded-full pill buttons matching landing page primary/secondary */}
            {step < 3 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-t border-slate-100 dark:border-zinc-800/40 px-6 py-4 flex justify-between z-20 items-center rounded-b-[2.5rem]">
                {step === 1 ? (
                  <div className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Fill event fields to proceed</div>
                ) : (
                  <button 
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold rounded-full transition-all text-sm"
                  >
                    Back
                  </button>
                )}
                
                {step === 1 ? (
                  <button 
                    onClick={handleNextStep1}
                    className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm px-7 py-3 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Next: Connect Drive <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleDriveSync}
                    disabled={!folderLink || isSyncing}
                    className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm px-7 py-3 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</> : <>Next: Review &amp; Publish <ArrowRight className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'one_qr' && (
          <motion.div
            key="one_qr"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[2.5rem] p-8 max-w-xl mx-auto text-center space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900 dark:text-zinc-50">One QR System</h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium mt-2">Your single persistent QR code, always routed to your active event gallery.</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/40 p-8 rounded-[2rem] inline-block shadow-lg">
              <QRCode value={globalQRLink} size={200} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
            </div>

            <div className="w-full max-w-md mx-auto space-y-4">
              <div className="flex gap-2 justify-center">
                <button className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-6 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Printable QR
                </button>
                <button 
                  onClick={() => copyLink(globalQRLink, 'oneqr_tab')}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold px-6 py-3.5 rounded-full transition-all text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> {copiedId === 'oneqr_tab' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium py-2 rounded-2xl bg-slate-100 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 select-all px-4">
                {globalQRLink}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 text-left"
          >
            {/* Page Header matching Settings section style */}
            <div className="mb-8">
              <h2 className="text-3xl font-medium text-slate-900 dark:text-zinc-50 tracking-tight mb-2">Analytics &amp; Performance</h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">Monitor public gallery visits, image downloads, and facial search registrations in real time.</p>
            </div>

            {/* Top Local Sub-Tabs matching reference mockup */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/40 pb-2">
              <div className="flex gap-6">
                {['Analytics', 'Registrations'].map((tab) => {
                  const isActive = analyticsSubTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setAnalyticsSubTab(tab)}
                      className={`px-2 py-2.5 text-sm font-medium tracking-tight border-b-2 transition-all -mb-[10px] relative select-none ${
                        isActive 
                          ? 'text-slate-900 dark:text-zinc-50 border-slate-900 dark:border-zinc-100' 
                          : 'text-slate-400 dark:text-zinc-500 border-transparent hover:opacity-60'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                })}
              </div>

              {/* Group By selector and Range Mock Picker */}
              <div className="flex items-center gap-3 text-xs shrink-0 relative">
                {/* Group By Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowGroupByDropdown(!showGroupByDropdown); setShowPeriodDropdown(false); }}
                    className="bg-white/60 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 px-3.5 py-2 rounded-full text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 select-none flex items-center gap-1.5 transition-colors"
                  >
                    Group By: {analyticsGroupBy}
                    <span className="text-[10px] opacity-60">▼</span>
                  </button>
                  {showGroupByDropdown && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1 flex flex-col gap-0.5">
                      {['Day', 'Week', 'Month'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setAnalyticsGroupBy(opt); setShowGroupByDropdown(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            analyticsGroupBy === opt 
                              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-bold' 
                              : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowPeriodDropdown(!showPeriodDropdown); setShowGroupByDropdown(false); }}
                    className="bg-white/60 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 px-3.5 py-2 rounded-full text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 select-none flex items-center gap-1.5 transition-colors"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-slate-500" /> 
                    {analyticsPeriod === '7' ? 'Last 7 Days' : analyticsPeriod === '30' ? 'Last 30 Days' : 'Last 90 Days'}
                    <span className="text-[10px] opacity-60">▼</span>
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1 flex flex-col gap-0.5">
                      {[
                        { id: '7', label: 'Last 7 Days' },
                        { id: '30', label: 'Last 30 Days' },
                        { id: '90', label: 'Last 90 Days' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setAnalyticsPeriod(opt.id); setShowPeriodDropdown(false); }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            analyticsPeriod === opt.id 
                              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-bold' 
                              : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {analyticsSubTab === 'Analytics' ? (
              <>
                {/* Gallery activity metrics grid */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900 dark:text-zinc-50">Gallery Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Gallery Visits', count: analyticsData.visits },
                      { label: 'Image Views', count: analyticsData.views },
                      { label: 'Image Downloads', count: analyticsData.downloads },
                      { label: 'Unique Guests', count: analyticsData.faceScans },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 p-6 rounded-[2rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg hover:border-slate-205 dark:hover:border-zinc-700/60 transition-all duration-300">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-550">{metric.label}</span>
                        <span className="text-3xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 mt-4">
                          <CountUp end={metric.count} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line/Area chart under curve */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-zinc-800/20">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight uppercase tracking-wider">Visits Over Time</h4>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-550 dark:text-zinc-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-zinc-100"></div>
                      Visits
                    </div>
                  </div>

                  {/* Animated drawing SVG Area curve chart */}
                  <CustomAreaChart timeline={analyticsData.timeline} />
                </div>
              </>
            ) : (
              /* Guest registrations table view */
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900 dark:text-zinc-50">Guest Registrations</h4>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/40 dark:border-zinc-800/40 px-3.5 py-1.5 rounded-full">
                    {events.length * 4 + 3} Face Scans Registered
                  </span>
                </div>
                
                <div className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-900/20 text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                          <th className="px-6 py-4">Guest Info</th>
                          <th className="px-6 py-4">Scan Date</th>
                          <th className="px-6 py-4">Photos Found</th>
                          <th className="px-6 py-4">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-105 dark:divide-zinc-800/30 text-sm">
                        {[
                          { name: 'Arish Dell', email: 'arish@gmail.com', date: 'Jul 04, 2026', matches: 14, status: 'Matched' },
                          { name: 'Sarah Connor', email: 'sarah.c@gmail.com', date: 'Jul 03, 2026', matches: 8, status: 'Matched' },
                          { name: 'Marcus Wright', email: 'marcus.w@yahoo.com', date: 'Jul 03, 2026', matches: 0, status: 'No Match' },
                          { name: 'John Connor', email: 'jconnor@resistance.net', date: 'Jul 02, 2026', matches: 21, status: 'Matched' },
                          { name: 'Kate Brewster', email: 'kate.b@health.gov', date: 'Jul 01, 2026', matches: 5, status: 'Matched' },
                        ].map((guest, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-all">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-350 flex items-center justify-center font-bold text-xs uppercase">
                                {guest.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-zinc-100">{guest.name}</div>
                                <div className="text-xs text-slate-400 dark:text-zinc-500">{guest.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{guest.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${guest.matches > 0 ? 'bg-emerald-550/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}`}>
                                {guest.matches} photos
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold ${guest.status === 'Matched' ? 'text-emerald-500' : 'text-slate-400 dark:text-zinc-500'}`}>
                                {guest.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
