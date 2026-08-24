import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Lock, Mail, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { googleSignIn, emailSignIn, emailSignUp } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export function AuthView({ onBack, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
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
        login('Google User', 'google.user@example.com');
      }
      onLoginSuccess();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isLogin && !name) {
      setError('Please enter your full name.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (USE_FIREBASE) {
        if (isLogin) {
          await emailSignIn(email, password);
        } else {
          await emailSignUp(email, password, name);
        }
      } else {
        login(name || email.split('@')[0], email);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let message = err.message || 'Authentication failed';
      if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
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
      
      {/* LEFT: Form Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-zinc-800/40">
        
        {/* Top nav bar — matches landing page nav style */}
        <div className="flex items-center justify-between px-8 py-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12 md:px-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <div className="mb-12">
              <Logo />
            </div>

            {/* Heading — font-medium tracking-tight, not font-black */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 dark:text-zinc-50 leading-[1.05] mb-3">
                {isLogin ? (
                  <>Welcome <span className="text-slate-400 dark:text-zinc-500">back.</span></>
                ) : (
                  <>Create your <span className="font-serif italic text-slate-400 dark:text-zinc-500">account.</span></>
                )}
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                {isLogin ? 'Sign in to manage your events and galleries.' : 'Start delivering AI-powered photo galleries.'}
              </p>
            </div>

            {/* Google Sign In — slate-900 rounded-full pill */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 mb-8 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-zinc-800/60" />
              </div>
              <div className="relative bg-white dark:bg-zinc-950 px-4 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                or continue with email
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      </div>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-all text-slate-900 dark:text-zinc-50 font-medium"
                        placeholder="Your full name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-all text-slate-900 dark:text-zinc-50 font-medium"
                    placeholder="hello@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                  Password
                  {isLogin && <a href="#" className="text-slate-500 dark:text-zinc-400 hover:opacity-60 transition-opacity text-xs">Forgot?</a>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-all text-slate-900 dark:text-zinc-50 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium flex items-start gap-3 border border-red-100 dark:border-red-900/30"
                >
                  <X className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </motion.div>
              )}

              {/* Email submit — secondary pill style */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-100 dark:bg-zinc-900/60 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/60 text-slate-900 dark:text-zinc-100 font-bold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Processing…' : (isLogin ? 'Sign In with Email' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-slate-900 dark:text-zinc-100 font-semibold hover:opacity-60 transition-opacity underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Visual Area — fanned photo cards with username pills */}
      <div className="hidden md:flex flex-1 bg-slate-900 dark:bg-zinc-900 relative overflow-hidden items-center justify-center">
        
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800" />

        {/* Fanned photo card cluster — matches landing page hero motif */}
        <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center z-10">

          {/* Card 1 — Far left, rotated */}
          <motion.div 
            initial={{ y: 80, x: 0, rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ y: 20, x: -160, rotate: -18, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3, delay: 0.1 }}
            className="absolute z-10 w-36 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-[#ff5e3a]"
          >
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-zinc-900/90 text-slate-900 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@sarah</div>
          </motion.div>

          {/* Card 2 — Left, slight rotation */}
          <motion.div 
            initial={{ y: 80, x: 0, rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ y: -10, x: -80, rotate: -8, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3, delay: 0.2 }}
            className="absolute z-20 w-44 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-[#0055ff]"
          >
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
          </motion.div>

          {/* Card 3 — Center (tallest, no rotation) */}
          <motion.div 
            initial={{ y: 80, x: 0, rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ y: -30, x: 10, rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3, delay: 0.25 }}
            className="absolute z-30 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-800"
          >
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover opacity-70 mix-blend-luminosity" />
            <div className="absolute inset-0 flex items-end p-4">
              <span className="text-white font-black text-xl transform -rotate-3 drop-shadow-lg">FACE AI</span>
            </div>
            <div className="absolute top-2 right-2 bg-white/90 text-slate-900 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100">@mike</div>
          </motion.div>

          {/* Card 4 — Right */}
          <motion.div 
            initial={{ y: 80, x: 0, rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ y: -10, x: 110, rotate: 10, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3, delay: 0.3 }}
            className="absolute z-20 w-40 h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-green-500"
          >
            <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-white/90 text-slate-900 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100">@andrea</div>
          </motion.div>

          {/* Floating "Face Matched" badge */}
          <motion.div 
            animate={{ y: [-8, 8, -8] }} 
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 z-40 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0055ff]">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Face Matched</div>
              <div className="text-[#c0ff00] text-xs font-semibold">Processed in 0.2s</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-10 px-8">
          <p className="text-slate-400 font-medium text-sm">Secure & private — photos processed through your connected Drive.</p>
        </div>
      </div>
    </div>
  );
}
