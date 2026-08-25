import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Monitor, Shield, LogOut, Bell, FileDown, BarChart3, Trash2, Eye, Activity, ShieldAlert, Undo } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');

  const [notifications, setNotifications] = useState(true);
  const [highRes, setHighRes] = useState(true);

  // Analytics Settings States
  const [trackViews, setTrackViews] = useState(true);
  const [trackDownloads, setTrackDownloads] = useState(true);
  const [trackFaceScan, setTrackFaceScan] = useState(true);
  const [anonymizeIP, setAnonymizeIP] = useState(true);
  const [retentionPeriod, setRetentionPeriod] = useState('90'); // '30', '90', '365', 'lifetime'

  const sections = [
    { id: 'account', label: 'Profile', icon: Shield },
    { id: 'appearance', label: 'Theme', icon: Sun },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'analytics', label: 'Analytics Config', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = (format) => {
    const dummyData = {
      platform: "PrivaPic / Potopic",
      exportedAt: new Date().toISOString(),
      retentionSetting: retentionPeriod === 'lifetime' ? 'Lifetime' : `${retentionPeriod} Days`,
      trackingConfiguration: {
        trackViews,
        trackDownloads,
        trackFaceScan,
        anonymizeIP
      },
      metrics: {
        totalViews: 456,
        totalDownloads: 198,
        successfulFaceScans: 89,
        failedFaceScans: 4
      }
    };
    
    let fileData = "";
    let filename = `potopic_analytics_${new Date().toISOString().slice(0,10)}`;
    let mimeType = "application/json";
    
    if (format === 'csv') {
      fileData = "Metric,Value\n" +
        `Total Views,456\n` +
        `Total Downloads,198\n` +
        `FaceScan Success,89\n` +
        `FaceScan Failed,4\n` +
        `Retention Setting,${retentionPeriod} days\n` +
        `IP Masking,${anonymizeIP ? "Enabled" : "Disabled"}\n`;
      filename += ".csv";
      mimeType = "text/csv";
    } else {
      fileData = JSON.stringify(dummyData, null, 2);
      filename += ".json";
    }
    
    const blob = new Blob([fileData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAnalytics = () => {
    if (confirm("Are you sure you want to purge all historical analytics databases? This action is irreversible.")) {
      alert("Analytics database successfully cleared.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full text-slate-900 dark:text-zinc-50 text-left space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 mb-2">Settings</h2>
        <p className="text-slate-500 dark:text-zinc-400 font-semibold text-sm">Manage configuration variables and preferences across the platform.</p>
      </div>

      {/* Premium Horizontal Navigation Tab-Pill-Bar */}
      <div className="bg-slate-100/80 dark:bg-zinc-900/60 p-1.5 rounded-full border border-slate-200/50 dark:border-zinc-800/40 max-w-xl mx-auto flex items-center justify-between gap-1 select-none backdrop-blur-md">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold transition-all relative cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-slate-900 dark:bg-zinc-100 rounded-full z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${
                isActive 
                  ? 'text-white dark:text-zinc-950 font-bold' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}>
                <section.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{section.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <div className="w-full mt-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeSection === 'account' && (
            <motion.div 
              key="account"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800/80 p-8 sm:p-10 shadow-sm space-y-8 relative overflow-hidden"
            >
              {/* Radial gradient backing for aesthetic layout depth */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 dark:bg-zinc-950/20 rounded-full blur-[100px] pointer-events-none -z-10" />

              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Account Profile</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">Details authenticated and linked via Google Sign-In.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-zinc-800/60">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-slate-900 dark:border-zinc-100 shadow-md object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-900 dark:bg-zinc-800 text-slate-100 flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
                    {user?.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{user?.displayName || 'Privapic User'}</div>
                  <div className="text-slate-500 dark:text-zinc-400 text-sm font-semibold mt-0.5">{user?.email || 'google-auth-user@gmail.com'}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-100 dark:border-zinc-850">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Google Integration Status</div>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Permission sync active for photo databases.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider select-none">Active</span>
                </div>

                <div className="flex justify-start">
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs px-6 py-3.5 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout from Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'appearance' && (
            <motion.div 
              key="appearance"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800/80 p-8 sm:p-10 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Theme Preferences</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">Select the visual skin configuration of the dashboard interface.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun, bg: 'bg-slate-50 border-slate-200' },
                  { id: 'dark', label: 'Dark Mode', icon: Moon, bg: 'bg-zinc-950 border-zinc-800' },
                  { id: 'system', label: 'System Mode', icon: Monitor, bg: 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-850' },
                ].map((t) => {
                  const isSel = theme === t.id;
                  return (
                    <button 
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-98 ${
                        isSel 
                          ? 'border-slate-900 dark:border-zinc-100 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-950 font-bold shadow-md' 
                          : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 text-slate-500 dark:text-zinc-400 bg-transparent'
                      }`}
                    >
                      {/* Mini visual representation */}
                      <div className={`w-16 h-10 rounded-lg ${t.bg} border p-1.5 flex items-center justify-between`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-500"></div>
                        <div className="w-6 h-1 rounded bg-slate-200 dark:bg-zinc-800"></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <t.icon className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase tracking-wider">{t.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeSection === 'preferences' && (
            <motion.div 
              key="preferences"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Notification card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center border border-slate-200/50 dark:border-zinc-850 shrink-0">
                    <Bell className="w-5 h-5 text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Email Sync Notifications</h4>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-md">Get emails notifying you when FaceSync AI is done indexing new images.</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer shrink-0 ${notifications ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-200 dark:bg-zinc-800'}`}
                >
                  <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-200 ${notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Delivery resolution card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center border border-slate-200/50 dark:border-zinc-850 shrink-0">
                    <FileDown className="w-5 h-5 text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">High Resolution Downloads</h4>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-md">Allow guests to export raw high-definition files directly from drive shares.</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button 
                  onClick={() => setHighRes(!highRes)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer shrink-0 ${highRes ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-200 dark:bg-zinc-800'}`}
                >
                  <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-200 ${highRes ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Analytics preferences card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800/80 p-8 sm:p-10 shadow-sm space-y-8">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Analytics Config</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">Tune metrics aggregation and diagnostic metrics reporting limits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Track views */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border border-slate-100 dark:border-zinc-850/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800/40">
                        <Eye className="w-4.5 h-4.5 text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Track Gallery Views</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Collect visitor hit count stats.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTrackViews(!trackViews)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${trackViews ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-250 dark:bg-zinc-800'}`}
                    >
                      <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-sm transform transition-transform duration-205 ${trackViews ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {/* Track downloads */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border border-slate-100 dark:border-zinc-850/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800/40">
                        <FileDown className="w-4.5 h-4.5 text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Track Downloads</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Log file saving operations.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTrackDownloads(!trackDownloads)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${trackDownloads ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-250 dark:bg-zinc-800'}`}
                    >
                      <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-sm transform transition-transform duration-205 ${trackDownloads ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {/* Face scan diagnostics */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border border-slate-100 dark:border-zinc-850/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800/40">
                        <Activity className="w-4.5 h-4.5 text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">FaceScan Diagnostics</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Monitor recognition execution logs.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTrackFaceScan(!trackFaceScan)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${trackFaceScan ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-250 dark:bg-zinc-800'}`}
                    >
                      <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-sm transform transition-transform duration-205 ${trackFaceScan ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {/* IP masking */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border border-slate-100 dark:border-zinc-850/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800/40">
                        <ShieldAlert className="w-4.5 h-4.5 text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Anonymize Visitor IPs</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Enforce strict data privacy rules.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAnonymizeIP(!anonymizeIP)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${anonymizeIP ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-slate-250 dark:bg-zinc-800'}`}
                    >
                      <div className={`w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-sm transform transition-transform duration-205 ${anonymizeIP ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>

                {/* Data Retention selector */}
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-bold text-slate-900 dark:text-white block">Analytics Data Retention</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '30', label: '30 Days' },
                      { id: '90', label: '90 Days' },
                      { id: '365', label: '1 Year' },
                      { id: 'lifetime', label: 'Lifetime' },
                    ].map((opt) => {
                      const isSel = retentionPeriod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setRetentionPeriod(opt.id)}
                          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSel
                              ? 'bg-slate-900 dark:bg-zinc-100 border-slate-900 dark:border-zinc-100 text-white dark:text-slate-900 shadow-sm'
                              : 'bg-transparent border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Database / Export Section */}
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('json')}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 text-slate-900 dark:text-white font-bold text-xs px-5 py-3 rounded-full transition-all border border-slate-200/50 dark:border-zinc-850 cursor-pointer"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 text-slate-900 dark:text-white font-bold text-xs px-5 py-3 rounded-full transition-all border border-slate-200/50 dark:border-zinc-850 cursor-pointer"
                    >
                      Export CSV
                    </button>
                  </div>

                  <button
                    onClick={handleClearAnalytics}
                    className="bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 font-bold text-xs px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 border border-red-500/10 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Purge Analytics Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
