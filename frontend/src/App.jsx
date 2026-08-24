import { useState, useEffect } from 'react';
import { Organizer } from './views/Organizer';
import { LandingPage } from './views/LandingPage';
import { PublicGallery } from './views/PublicGallery';
import { AuthView } from './views/AuthView';
import { Settings } from './views/Settings';
import { MyEvents } from './views/MyEvents';
import { Menu, X } from 'lucide-react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import { GridBackground } from './components/GridBackground';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicData, setPublicData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (eventId) {
      setPublicData({ eventId, orgName: 'Event Guest', eventName: 'Photo Gallery' });
      setActiveTab('public');
    }
  }, []);

  // Route Guard
  useEffect(() => {
    if (activeTab === 'organizer' && !user) {
      setActiveTab('auth');
    }
    if (activeTab === 'auth' && user) {
      setActiveTab('organizer');
    }
  }, [activeTab, user]);

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab('landing');
    } catch (e) {
      console.error(e);
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
      case 'organizer': return 'Home';
      case 'events': return 'My Events';
      case 'create_event': return 'Create Event';
      case 'one_qr': return 'One QR';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Home';
    }
  };

  const renderView = () => {
    if (activeTab === 'landing') {
      return (
        <PageTransition key="landing" className="w-full relative z-10">
          <LandingPage onStart={() => setActiveTab(user ? 'organizer' : 'auth')} />
        </PageTransition>
      );
    }

    if (activeTab === 'auth') {
      return (
        <PageTransition key="auth" className="w-full min-h-screen relative z-10 bg-transparent">
          <AuthView onBack={() => setActiveTab('landing')} onLoginSuccess={() => setActiveTab('organizer')} />
        </PageTransition>
      );
    }

    if (activeTab === 'public') {
      return (
        <PageTransition key="public" className="w-full relative z-10 min-h-screen bg-transparent">
          <PublicGallery eventData={publicData} onBack={() => {
            window.history.replaceState({}, '', '/');
            setActiveTab('landing');
          }} />
        </PageTransition>
      );
    }

    // Dashboard Shell
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
          <Logo onClick={() => setActiveTab('landing')} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main id="content-container" className="flex-1 bg-white dark:bg-zinc-950 overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800/40 relative z-20">
          {/* Dashboard Header — mirrors landing nav style */}
          <header className="hidden md:flex bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl h-16 items-center px-10 sticky top-0 z-10 justify-between border-b border-slate-100 dark:border-zinc-800/40">
            <h1 className="text-base font-medium tracking-tight text-slate-900 dark:text-zinc-50">
              {getDashboardTitle()}
            </h1>
            <div className="flex items-center gap-6">
              <ThemeToggle />

              {/* User avatar/name dropdown — soft hover:opacity style */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 cursor-pointer focus:outline-none hover:opacity-70 transition-opacity"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {user?.displayName || 'Organizer'}
                  </span>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs uppercase">
                      {user?.displayName ? user.displayName[0] : 'O'}
                    </div>
                  )}
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        className="absolute right-0 mt-3 w-44 bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-100 dark:border-zinc-800/60 rounded-2xl shadow-xl py-2 z-40 text-left"
                      >
                        <button 
                          onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:opacity-60 transition-opacity text-slate-700 dark:text-zinc-300"
                        >
                          Settings
                        </button>
                        <button 
                          onClick={() => { handleLogout(); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:opacity-60 transition-opacity text-red-500"
                        >
                          Logout
                        </button>
                      </motion.div>
                    </>
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
        
        {/* Mobile overlay */}
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
    <>
      <div className="min-h-screen font-sans selection:bg-slate-200 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 relative overflow-hidden flex w-full">
        <GridBackground />
        <div className="relative z-10 w-full flex flex-col">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
