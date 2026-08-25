import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, X, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { googleSignIn, emailSignIn } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export function AuthView({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, USE_FIREBASE } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (USE_FIREBASE) {
        await googleSignIn();
      } else {
        login('Admin Organizer', 'admin@photopic.app');
      }
      onLoginSuccess();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in as Admin');
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans w-full selection:bg-slate-200">
      
      {/* LEFT: Admin Form Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-zinc-800/40">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
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
            <div className="mb-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-6 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-2">
                Admin Sign In
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                Organizer access to manage events, photo folders, and attendee QR codes.
              </p>
            </div>

            {/* Google Sign In */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 mb-6 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Signing in…' : 'Sign In with Google'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-zinc-800/60" />
              </div>
              <div className="relative bg-white dark:bg-zinc-950 px-4 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                or sign in with admin credentials
              </div>
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-all text-slate-900 dark:text-zinc-50 text-sm font-medium"
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-all text-slate-900 dark:text-zinc-50 text-sm font-medium"
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
                className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-sm shadow-sm"
              >
                {loading ? 'Authenticating…' : 'Log In to Admin Dashboard'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Visual Area */}
      <div className="hidden md:flex flex-1 bg-slate-900 dark:bg-zinc-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800" />

        <div className="relative z-10 text-center max-w-sm px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Photopic Organizer</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Privacy-first face recognition platform powered by high-accuracy SFace + OpenCV local AI.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active SFace Recognition Engine
          </div>
        </div>
      </div>
    </div>
  );
}
