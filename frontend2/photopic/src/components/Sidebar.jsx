import { Home, FolderHeart, PlusCircle, QrCode, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';

export function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab('landing');
      setMobileMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'organizer', icon: Home, label: 'Home' },
    { id: 'events', icon: FolderHeart, label: 'My Events' },
    { id: 'create_event', icon: PlusCircle, label: 'Create Event' },
    { id: 'one_qr', icon: QrCode, label: 'One QR' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-r border-slate-100 dark:border-zinc-800/40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 flex flex-col justify-between py-8 px-5 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Top: Logo */}
      <div className="flex flex-col gap-10">
        <div className="px-2">
          <Logo onClick={() => { setActiveTab('organizer'); setMobileMenuOpen(false); }} />
        </div>
        
        {/* Navigation — soft hover:opacity style matching landing nav links */}
        <nav className="flex flex-col gap-0.5 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'organizer' && activeTab === 'dashboard');
            return (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm relative select-none text-left ${
                  isActive 
                    ? 'text-slate-900 dark:text-zinc-50' 
                    : 'text-slate-500 dark:text-zinc-400 hover:opacity-60'
                }`}
              >
                {/* Subtle active background — not a heavy filled pill */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBg"
                    className="absolute inset-0 bg-slate-100 dark:bg-zinc-800/60 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                {/* Small dot active indicator on left edge */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveDot"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-900 dark:bg-zinc-100 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <item.icon className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom: ThemeToggle + Logout */}
      <div className="flex flex-col gap-3 px-1">
        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Theme</span>
          <ThemeToggle />
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800/40 pt-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-opacity text-sm text-slate-500 dark:text-zinc-400 hover:opacity-60 text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 opacity-50" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
