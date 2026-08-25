import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, X, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { emailSignIn } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export function AuthView({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, USE_FIREBASE } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (USE_FIREBASE) {
        await emailSignIn(email, password);
      } else {
        login(email.split('@')[0] || 'Admin', email);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let message = err.message || 'Authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid admin email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans w-full selection:bg-purple-100">
      
      {/* LEFT: Admin Form Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-zinc-800/40">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <Logo size="default" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#6e2b8b] dark:text-[#da7756] border border-purple-200/50 dark:border-purple-900/40">
              Admin Portal
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12 md:px-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-2">
                Admin Sign In
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                Organizer access to manage events, photo folders, and attendee QR codes.
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] focus:border-[#6e2b8b] transition-all text-slate-900 dark:text-zinc-50 text-sm font-medium"
                    placeholder="admin@photopic.app"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] focus:border-[#6e2b8b] transition-all text-slate-900 dark:text-zinc-50 text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-start gap-2 border border-red-100 dark:border-red-900/30"
                >
                  <X className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-semibold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-sm shadow-md shadow-purple-900/20 mt-2"
              >
                {loading ? 'Authenticating…' : 'Log In to Admin Dashboard'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Visual Area */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#220a2e] via-[#15061c] to-[#0c0410] relative overflow-hidden items-center justify-center">
        {/* Glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6e2b8b]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#da7756]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-sm px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#6e2b8b] to-[#da7756] p-0.5 shadow-2xl">
            <div className="w-full h-full bg-[#15061c] rounded-[22px] flex items-center justify-center text-white">
              <ShieldCheck className="w-9 h-9 text-[#da7756]" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">GWC Event FaceSync</h2>
          <p className="text-purple-200/70 text-sm leading-relaxed mb-6">
            Privacy-first face recognition platform powered by high-accuracy SFace + OpenCV local AI.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#da7756] animate-pulse" />
            Active SFace Recognition Engine
          </div>
        </div>
      </div>
    </div>
  );
}
