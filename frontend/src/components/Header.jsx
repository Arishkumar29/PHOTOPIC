import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header({ onStart }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-palette-teal-900/80 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {['How it works', 'Use Cases', 'Pricing'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-palette-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={onStart}
            className="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-slate-200 text-white dark:text-black text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
