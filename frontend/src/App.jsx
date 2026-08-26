import { useState, useEffect, useRef } from 'react';
import { Organizer } from './views/Organizer';
import { PublicGallery } from './views/PublicGallery';
import { AuthView } from './views/AuthView';
import { Settings } from './views/Settings';
import { MyEvents } from './views/MyEvents';
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import { GridBackground } from './components/GridBackground';

export default function App() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('event') ? 'public' : (user ? 'organizer' : 'auth');
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicData, setPublicData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    return eventId ? { eventId, orgName: 'Event Guest', eventName: 'Photo Gallery' } : null;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (eventId) {
      setPublicData({ eventId, orgName: 'Event Guest', eventName: 'Photo Gallery' });
      setActiveTab('public');
    } else {
      if (!user) {
        setActiveTab('auth');
      } else if (activeTab === 'auth') {
        setActiveTab('organizer');
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      setActiveTab('auth');
    } catch (e) {
      console.error('Logout error:', e);
      setActiveTab('auth');
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'organizer':
        return (
          <PageTransition key="organizer-dash">
            <Organizer 
              initialView="dashboard"
              onOpenPublicView={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }} 
            />
          </PageTransition>
        );
      case 'create_event':
        return (
          <PageTransition key="create-event-dash">
            <Organizer 
              initialView="create"
              onOpenPublicView={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }} 
            />
          </PageTransition>
        );
      case 'one_qr':
        return (
          <PageTransition key="one-qr-dash">
            <Organizer 
              initialView="one_qr"
              onOpenPublicView={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }} 
            />
          </PageTransition>
        );
      case 'analytics':
        return (
          <PageTransition key="analytics-dash">
            <Organizer 
              initialView="analytics"
              onOpenPublicView={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }} 
            />
          </PageTransition>
        );
      case 'events':
        return (
          <PageTransition key="events">
            <MyEvents 
              onCreateEventClick={() => setActiveTab('create_event')}
              onSelectEvent={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }}
            />
          </PageTransition>
        );
      case 'settings':
        return <PageTransition key="settings"><Settings /></PageTransition>;
      default:
        return null;
    }
  };

  const getDashboardTitle = () => {
    switch (activeTab) {
      case 'organizer': return 'Dashboard';
      case 'events': return 'My Events';
      case 'create_event': return 'Create Event';
      case 'one_qr': return 'QR Code Portal';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };

  const renderView = () => {
    // Guest QR & Selfie Portal
    if (activeTab === 'public') {
      return (
        <PageTransition key="public" className="w-full relative z-10 min-h-screen bg-transparent">
          <PublicGallery 
            eventData={publicData} 
            onBack={() => {
              if (user) {
                setActiveTab('organizer');
              } else {
                setActiveTab('auth');
              }
            }} 
          />
        </PageTransition>
      );
    }

    // Admin Login
    if (activeTab === 'auth' || !user) {
      return (
        <PageTransition key="auth" className="w-full min-h-screen relative z-10 bg-transparent">
          <AuthView onLoginSuccess={() => setActiveTab('organizer')} />
        </PageTransition>
      );
    }

    // Admin Dashboard Shell
    return (
      <PageTransition key="dashboard" className="w-full min-h-screen bg-transparent text-slate-900 dark:text-zinc-50 font-sans flex flex-col md:flex-row selection:bg-slate-200 relative z-10">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />

        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800/40 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
          <Logo onClick={() => setActiveTab('organizer')} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => handleLogout()}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/40 cursor-pointer hover:opacity-80"
              title="Logout to Admin Login"
            >
              Logout
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main id="content-container" className="flex-1 bg-white dark:bg-zinc-950 overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800/40 relative z-20">
          <header className="hidden md:flex bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl h-16 items-center px-10 sticky top-0 z-30 justify-between border-b border-slate-100 dark:border-zinc-800/40">
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              {getDashboardTitle()}
            </h1>
            <div className="flex items-center gap-6">
              <ThemeToggle />

              {/* Admin Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-zinc-800/60 hover:bg-slate-200/80 dark:hover:bg-zinc-700/60 border border-slate-200/60 dark:border-zinc-700/60 transition-all cursor-pointer select-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {user?.displayName || 'Admin Organizer'}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6e2b8b] to-[#da7756] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.displayName ? user.displayName[0] : 'A'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xl shadow-purple-950/5 p-1.5 z-50 text-left"
                    >
                      {/* User Info Header */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 mb-1 border border-slate-100/80 dark:border-zinc-800/40">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e2b8b] to-[#da7756] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0">
                            {user?.displayName ? user.displayName[0] : 'A'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-zinc-50 truncate">
                              {user?.displayName || 'Admin Organizer'}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-400 truncate mt-0.5">
                              {user?.email || 'admin@photopic.app'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-700/50">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Shield className="w-2.5 h-2.5" /> Super Admin
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">Active</span>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="space-y-0.5">
                        <button 
                          onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#6e2b8b] dark:hover:text-[#da7756] transition-colors text-slate-700 dark:text-zinc-200 cursor-pointer"
                        >
                          <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:text-[#6e2b8b]" />
                          Settings
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 md:p-12 lg:p-16 relative z-0">
            <AnimatePresence mode="wait">
              {renderDashboardContent()}
            </AnimatePresence>
          </div>
        </main>
        
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </PageTransition>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-slate-200 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 relative overflow-hidden flex w-full">
      <GridBackground />
      <div className="relative z-10 w-full flex flex-col">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </div>
    </div>
  );
}
