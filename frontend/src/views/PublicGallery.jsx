import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Download, RefreshCcw, ScanFace, X, ChevronLeft, ChevronRight, Search, Sliders, Undo, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

export function PublicGallery({ eventData, onBack }) {
  const [currentEvent, setCurrentEvent] = useState(eventData);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const videoRef = useRef(null);

  // Photo editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editFilters, setEditFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    hue: 0
  });
  const [activePreset, setActivePreset] = useState('original');
  const [isDownloading, setIsDownloading] = useState(false);

  // Load active event if not supplied in props
  useEffect(() => {
    if (eventData?.eventId) {
      setCurrentEvent(eventData);
    } else {
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          if (data.events && data.events.length > 0) {
            setCurrentEvent(data.events[0]);
          }
        })
        .catch(console.error);
    }
  }, [eventData]);

  // Auto track visits to backend
  useEffect(() => {
    const id = currentEvent?.eventId || eventData?.eventId;
    if (id) {
      fetch(`/api/events/${id}/track-visit`, { method: 'POST' })
        .catch(err => console.error("Failed to track visit", err));
    }
  }, [currentEvent, eventData]);

  // CSS Filter string compiler
  const getFilterString = () => {
    if (activePreset === 'warm') return 'brightness(105%) contrast(102%) saturate(120%) sepia(20%)';
    if (activePreset === 'cool') return 'brightness(102%) contrast(105%) saturate(110%) hue-rotate(15deg)';
    if (activePreset === 'noir') return 'grayscale(100%) contrast(120%)';
    if (activePreset === 'vintage') return 'sepia(60%) contrast(90%) brightness(105%)';
    if (activePreset === 'vivid') return 'saturate(150%) contrast(110%)';
    return `brightness(${editFilters.brightness}%) contrast(${editFilters.contrast}%) saturate(${editFilters.saturation}%) sepia(${editFilters.sepia}%) hue-rotate(${editFilters.hue}deg)`;
  };

  const handleDownload = async (url) => {
    setIsDownloading(true);
    try {
      const id = currentEvent?.eventId || eventData?.eventId;
      if (id) {
        await fetch(`/api/events/${id}/track-download`, { method: 'POST' }).catch(() => {});
      }

      const response = await fetch(url);
      const blob = await response.blob();
      
      const hasEdits = isEditing && (activePreset !== 'original' || 
                        editFilters.brightness !== 100 || 
                        editFilters.contrast !== 100 || 
                        editFilters.saturation !== 100 || 
                        editFilters.sepia !== 0 || 
                        editFilters.hue !== 0);

      if (hasEdits) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.filter = getFilterString();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((editedBlob) => {
              if (editedBlob) {
                const blobUrl = URL.createObjectURL(editedBlob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `photopic_${id || 'event'}_edited.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
              }
            }, 'image/jpeg', 0.95);
          }
        };
        img.src = url;
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `photopic_${id || 'event'}_photo.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Blob download failed, falling back to new tab", err);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      setPhoto(null);
      setMatchedPhotos(null);
      setScanError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setScanError('Failed to access camera. Please ensure camera permissions are enabled in your browser settings.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPhoto(photoDataUrl);
      stopCamera();
      findMyPhotos(photoDataUrl);
    }
  };

  const findMyPhotos = async (photoDataUrl) => {
    setIsScanning(true);
    setScanError(null);
    const activeEventId = currentEvent?.eventId || eventData?.eventId || 'evt_sample';
    try {
      const response = await fetch('/api/scan-faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEventId,
          referenceImage: photoDataUrl
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan photos');
      }
      
      setMatchedPhotos(data.matches || []);
    } catch (err) {
      console.error(err);
      setScanError(err.message || 'An error occurred while finding photos.');
      setMatchedPhotos([]);
    } finally {
      setIsScanning(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && matchedPhotos) {
      setLightboxIndex((lightboxIndex + 1) % matchedPhotos.length);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && matchedPhotos) {
      setLightboxIndex((lightboxIndex - 1 + matchedPhotos.length) % matchedPhotos.length);
    }
  };

  const activeEvent = currentEvent || eventData;

  // Invalid event — fun & warm card
  if (!activeEvent?.eventId) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="bg-gradient-to-br from-purple-50/80 via-white to-orange-50/50 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-850 border border-purple-100 dark:border-zinc-800/80 max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#6e2b8b]/10 to-[#da7756]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl select-none">
            🎈
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-3">Looking for a party? ✨</h2>
          <p className="text-slate-600 dark:text-zinc-400 font-medium text-sm sm:text-base leading-relaxed mb-8">
            This event link has wrapped up or hasn't opened yet! Please double-check your QR code or reach out to the event host.
          </p>
          <button 
            onClick={onBack} 
            className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-purple-950/20 hover:scale-102 cursor-pointer"
          >
            Back to Portal
          </button>
        </motion.div>
      </div>
    );
  }

  const handleLogoClick = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setPhoto(null);
    setMatchedPhotos(null);
    setScanError(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-slate-200 text-slate-900 dark:text-zinc-50">
      
      {/* Header — matches landing nav style exactly */}
      <header className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800/40 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Logo onClick={handleLogoClick} />
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{activeEvent?.eventName || eventData?.eventName || 'Event Gallery'}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">by {activeEvent?.orgName || eventData?.orgName || 'Organizer'}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
             {/* Initial state — hero CTA with Scrolling Photo Showcase */}
        {!photo && !stream && !matchedPhotos && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className="w-full"
          >
            {/* Inline CSS styling block for Marquee Animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes marqueeUp {
                0% { transform: translateY(0); }
                50% { transform: translateY(-25%); }
                100% { transform: translateY(0); }
              }
              @keyframes marqueeDown {
                0% { transform: translateY(-25%); }
                50% { transform: translateY(0); }
                100% { transform: translateY(-25%); }
              }
              .animate-marquee-up {
                animation: marqueeUp 24s ease-in-out infinite;
              }
              .animate-marquee-down {
                animation: marqueeDown 24s ease-in-out infinite;
              }
            `}} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-6 md:mt-16 max-w-6xl mx-auto text-left">
              {/* Left Column: CTA */}
              <div className="lg:col-span-6 text-center lg:text-left space-y-6 md:space-y-8">
                {/* GWC Brand badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#6e2b8b] dark:text-[#da7756] font-bold text-xs uppercase tracking-wider border border-purple-200/50 dark:border-purple-900/40 select-none">
                  <Search className="w-3.5 h-3.5 animate-pulse text-[#da7756]" /> GWC FaceSync
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 leading-[1.05]">
                  Find your photos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756] font-serif italic">in seconds.</span>
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                  Take a quick selfie and let our AI scan the event gallery to find every photo you appear in.
                </p>
                
                <button 
                  onClick={startCamera}
                  className="group relative overflow-hidden bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white font-extrabold text-lg px-10 py-5 rounded-full hover:opacity-95 shadow-xl shadow-purple-950/25 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 mx-auto lg:mx-0 cursor-pointer"
                >
                  <Camera className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Take Selfie</span>
                </button>
              </div>

              {/* Right Column: 3D Mascot Superhero AI Showcase */}
              <div className="lg:col-span-6 relative h-[380px] sm:h-[480px] w-full flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-50/80 via-white to-orange-50/60 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-850 border border-purple-100 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm">
                {/* Soft ambient gradient orb */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,43,139,0.08)_0%,transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#6e2b8b]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#da7756]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Flying Rocket Mascot */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <motion.img 
                    src="/mascot_rocket.png" 
                    alt="AI Powered Speed Sync" 
                    animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-56 sm:w-64 md:w-72 max-h-[300px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(110,43,139,0.22)] select-none pointer-events-none"
                  />

                  {/* Feature Badges floating below mascot */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 relative z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-200 text-xs font-bold shadow-sm border border-purple-100 dark:border-zinc-700 flex items-center gap-1.5 select-none">
                      <Sparkles className="w-3.5 h-3.5 text-[#da7756]" /> 99.8% SFace Accuracy
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/60 text-[#6e2b8b] dark:text-[#da7756] text-xs font-bold shadow-sm border border-purple-200/60 select-none">
                      ⚡ 0.4s Instant Discovery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Camera view */}
        {stream && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-to-br from-purple-50/90 via-white to-orange-50/60 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-850 rounded-[2.5rem] p-4 shadow-xl border border-purple-100 dark:border-zinc-800 relative overflow-hidden">
              {/* Close / cancel camera button */}
              <button 
                onClick={stopCamera}
                className="absolute top-6 right-6 z-40 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Close Camera"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-900 relative shadow-inner">
                <video 
                  id="camera-preview"
                  ref={(node) => {
                    videoRef.current = node;
                    if (node && stream) {
                      node.srcObject = stream;
                    }
                  }}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                
                {/* Scanner overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scan line */}
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6e2b8b] via-[#da7756] to-[#6e2b8b] shadow-[0_0_15px_5px_rgba(218,119,86,0.6)] z-30"
                  />
                  {/* Scan overlay tint */}
                  <motion.div 
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-purple-500 mix-blend-overlay z-20"
                  />
                  {/* Face bounding box */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-44 h-52 relative">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-white" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-white" />
                    </div>
                  </div>
                  {/* Align face label */}
                  <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <span className="text-white font-bold tracking-widest text-xs uppercase bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">ALIGN FACE</span>
                  </div>
                </div>
              </div>
              
              {/* Capture button */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <button 
                  onClick={capturePhoto}
                  className="w-18 h-18 bg-white rounded-full border-4 border-[#6e2b8b]/30 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  style={{ width: '72px', height: '72px' }}
                >
                  <div className="w-13 h-13 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] rounded-full shadow-inner" style={{ width: '52px', height: '52px' }} />
                </button>
              </div>
            </div>
            <p className="text-center text-slate-500 dark:text-zinc-400 font-medium mt-6">Position your face clearly in the frame.</p>
          </motion.div>
        )}

        {/* Scanning State — Holographic Diagnostic Panel */}
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-gradient-to-br from-purple-50/90 via-white to-orange-50/60 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-850 text-slate-900 dark:text-zinc-50 rounded-[2.5rem] p-8 border border-purple-100 dark:border-zinc-800 shadow-xl relative overflow-hidden text-center space-y-6"
          >
            {/* Thinking Mascot Illustration with Laser Scan */}
            <div className="relative w-44 h-44 rounded-[2rem] overflow-hidden bg-white/60 dark:bg-zinc-800/60 border-2 border-[#da7756] shadow-[0_0_30px_rgba(218,119,86,0.25)] mx-auto flex items-center justify-center p-2">
              <motion.img 
                src="/mascot_thinking.png" 
                alt="AI Thinking" 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full object-contain drop-shadow-md"
              />
              
              {/* Laser line sweeping */}
              <motion.div 
                animate={{ y: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6e2b8b] via-[#da7756] to-[#6e2b8b] shadow-[0_0_12px_rgba(218,119,86,1)] z-20"
              />
            </div>

            {/* Animated progress indicators */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#da7756] animate-ping"></span>
                Searching Your Photos...
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 text-xs max-w-xs mx-auto">
                GWC SFace Engine is computing 512-d embeddings and matching them against the gallery album...
              </p>
            </div>

            {/* Diagnostic indicator */}
            <div className="relative w-full py-2 flex justify-center items-center">
              <div className="text-[11px] font-semibold tracking-wider text-[#6e2b8b] dark:text-[#da7756] animate-pulse uppercase">
                Matching Face Vectors
              </div>
            </div>
          </motion.div>
        )}

        {/* Results / Error State */}
        {!isScanning && (matchedPhotos || scanError) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full"
          >
            {/* Header banner when matched */}
            {!scanError && matchedPhotos && matchedPhotos.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 via-white to-orange-50 dark:from-zinc-900 dark:to-zinc-850 text-slate-900 dark:text-zinc-50 border border-purple-100 dark:border-zinc-800 p-5 sm:p-6 rounded-[2rem] mb-8 sm:mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#da7756] shrink-0 shadow-md">
                    <img src={photo} alt="Your selfie" className="w-full h-full object-cover transform -scale-x-100" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Here are your photos! 🎉</h3>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      Found {matchedPhotos?.length} match{matchedPhotos?.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={startCamera}
                  className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-md shadow-purple-950/20 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Retake Selfie
                </button>
              </div>
            )}

            {/* Error / No Photo Found State — Fun & Engaging with Sad Mascot */}
            {scanError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50/80 via-white to-orange-50/50 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-850 border border-purple-100 dark:border-zinc-800/80 rounded-[2.5rem] p-10 text-center mb-12 shadow-sm max-w-lg mx-auto"
              >
                <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                  <motion.img 
                    src="/mascot_sad.png" 
                    alt="No photo found" 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-3">
                  Playing Hide &amp; Seek? ✨
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 font-medium text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
                  We couldn't spot your smile in this batch just yet! The host might still be uploading more high-res event moments.
                </p>
                <button 
                  onClick={startCamera}
                  className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-purple-950/20 transition-all hover:scale-102 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try Another Selfie 🤳
                </button>
              </motion.div>
            )}

            {/* Empty state — Fun & Friendly with Sad Mascot */}
            {!scanError && matchedPhotos?.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="bg-gradient-to-br from-purple-50/80 via-white to-orange-50/50 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-850 border border-purple-100 dark:border-zinc-800/80 rounded-[2.5rem] p-10 text-center max-w-lg mx-auto shadow-sm"
              >
                <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                  <motion.img 
                    src="/mascot_sad.png" 
                    alt="No matches" 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-3">
                  No matches found... <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756] font-serif italic">yet!</span>
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto mb-8 text-sm sm:text-base">
                  Our AI combed through the event album, but didn't catch your face this time. Try taking a brighter, front-facing selfie, or check back soon as more snaps get uploaded!
                </p>
                <button 
                  onClick={startCamera}
                  className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-purple-950/20 transition-all hover:scale-102 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Take Another Selfie 📸
                </button>
              </motion.div>
            )}

            {/* Photo grid — grayscale-to-color hover transition matching Faces Grid section */}
            {!scanError && matchedPhotos && matchedPhotos.length > 0 && (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5 space-y-4 sm:space-y-5">
                {matchedPhotos.map((photoUrl, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', bounce: 0.2 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    className="break-inside-avoid relative group cursor-pointer"
                    onClick={() => openLightbox(i)}
                  >
                    <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                      {/* Grayscale-to-color on hover — matches Faces Grid treatment */}
                      <img 
                        src={photoUrl} 
                        alt={`Match ${i + 1}`} 
                        className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500 group-hover:grayscale-0"
                        loading="lazy"
                      />
                      
                      {/* Match Badge (always visible on top left) */}
                      <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full select-none shadow-md">
                          MATCH
                        </span>
                      </div>

                      {/* Hover eye overlay for desktop view indicators */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-white/25 backdrop-blur-md text-white p-3 rounded-full border border-white/30 shadow-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Download Button (always visible in bottom right) */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(photoUrl); }}
                        className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/25 transition-all hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer z-20 shadow-md"
                        title="Download Photo"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxIndex !== null && matchedPhotos && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex flex-col md:flex-row"
              onClick={closeLightbox}
            >
            {/* Header controls */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-50 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                    isEditing 
                      ? 'bg-white text-black border-white shadow-lg font-black' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isEditing ? 'Tuning Colors...' : 'Tune Colors'}
                </button>
              </div>
              
              <button 
                className="text-white/60 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20 pointer-events-auto shadow-md"
                onClick={closeLightbox}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            {/* Left/Main Content area: Image frame */}
            <div className="flex-1 flex items-center justify-center relative p-8 select-none cursor-zoom-out" onClick={closeLightbox}>
              <button 
                onClick={prevPhoto} 
                className="absolute left-4 sm:left-6 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-full transition-all z-40 border border-transparent hover:border-white/20 shadow-md cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>

              <div 
                className="relative w-full h-full max-h-[65vh] sm:max-h-[75vh] max-w-[85vw] flex items-center justify-center rounded-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img 
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  src={matchedPhotos[lightboxIndex]} 
                  alt="Fullscreen view" 
                  style={{ filter: getFilterString() }}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-150"
                />
              </div>

              <button 
                onClick={nextPhoto} 
                className="absolute right-4 sm:right-6 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-full transition-all z-40 border border-transparent hover:border-white/20 shadow-md cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              
              {/* Bottom controls panel when NOT editing */}
              {!isEditing && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <button 
                    disabled={isDownloading}
                    className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-900 font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 hover:shadow-xl transition-all shadow-lg text-sm cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleDownload(matchedPhotos[lightboxIndex]); }}
                  >
                    <Download className="w-4 h-4" /> {isDownloading ? 'Saving...' : 'Save High-Res'}
                  </button>
                </div>
              )}
            </div>

            {/* Right sidebar area: Editor panel */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="w-full md:w-80 bg-zinc-950/80 backdrop-blur-xl border-t md:border-t-0 md:border-l border-zinc-800/60 p-6 flex flex-col justify-between shrink-0 overflow-y-auto max-h-[45vh] md:max-h-screen z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6 pt-10 md:pt-14">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Color Tuning</h4>
                      <p className="text-[11px] text-zinc-550 mt-1">Adjust presets or custom parameters to correct color balances.</p>
                    </div>

                    {/* Presets List */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Presets</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'original', label: 'Original' },
                          { id: 'warm', label: 'Warm Glow' },
                          { id: 'cool', label: 'Cool Breeze' },
                          { id: 'noir', label: 'Noir' },
                          { id: 'vintage', label: 'Vintage' },
                          { id: 'vivid', label: 'Vivid' }
                        ].map((preset) => {
                          const isActive = activePreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setActivePreset(preset.id);
                                if (preset.id !== 'original') {
                                  setEditFilters({ brightness: 100, contrast: 100, saturation: 100, sepia: 0, hue: 0 });
                                }
                              }}
                              className={`py-2 px-1 rounded-xl text-[10px] font-semibold transition-all text-center border ${
                                isActive 
                                  ? 'bg-white border-white text-black shadow-sm font-bold' 
                                  : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Adjustments */}
                    {activePreset === 'original' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Custom Tuning</label>
                          <button
                            onClick={() => setEditFilters({ brightness: 100, contrast: 100, saturation: 100, sepia: 0, hue: 0 })}
                            className="text-[10px] font-bold text-white hover:text-zinc-200 flex items-center gap-1 transition-colors"
                          >
                            <Undo className="w-3 h-3" /> Reset
                          </button>
                        </div>

                        {/* Brightness */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Brightness</span>
                            <span>{editFilters.brightness}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            value={editFilters.brightness} 
                            onChange={(e) => setEditFilters({ ...editFilters, brightness: parseInt(e.target.value) })}
                            className="w-full accent-white bg-white/10 rounded-lg appearance-none h-1"
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Contrast</span>
                            <span>{editFilters.contrast}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            value={editFilters.contrast} 
                            onChange={(e) => setEditFilters({ ...editFilters, contrast: parseInt(e.target.value) })}
                            className="w-full accent-white bg-white/10 rounded-lg appearance-none h-1"
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Saturation</span>
                            <span>{editFilters.saturation}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={editFilters.saturation} 
                            onChange={(e) => setEditFilters({ ...editFilters, saturation: parseInt(e.target.value) })}
                            className="w-full accent-white bg-white/10 rounded-lg appearance-none h-1"
                          />
                        </div>

                        {/* Sepia */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Sepia</span>
                            <span>{editFilters.sepia}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={editFilters.sepia} 
                            onChange={(e) => setEditFilters({ ...editFilters, sepia: parseInt(e.target.value) })}
                            className="w-full accent-white bg-white/10 rounded-lg appearance-none h-1"
                          />
                        </div>

                        {/* Hue Rotate */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Hue Rotate</span>
                            <span>{editFilters.hue}°</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={editFilters.hue} 
                            onChange={(e) => setEditFilters({ ...editFilters, hue: parseInt(e.target.value) })}
                            className="w-full accent-white bg-white/10 rounded-lg appearance-none h-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-zinc-900 mt-4">
                    <button
                      onClick={() => handleDownload(matchedPhotos[lightboxIndex])}
                      disabled={isDownloading}
                      className="w-full bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isDownloading ? 'Downloading...' : 'Download Edited Photo'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
