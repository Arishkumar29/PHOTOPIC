import { Camera } from 'lucide-react';

export function Logo({ dark = false, onClick, showText = true }) {
  if (!showText) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-center w-12 h-12 bg-slate-900 dark:bg-zinc-950 text-white rounded-2xl cursor-pointer select-none transition-all hover:scale-105 hover:rotate-12 duration-500 shadow-md border border-white/10"
      >
        <Camera className="w-6 h-6 text-slate-900 dark:text-zinc-100" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-baseline gap-[2px] font-display font-bold text-2xl tracking-tighter cursor-pointer select-none transition-transform hover:scale-105 duration-500 ease-out ${dark ? 'text-white' : 'text-black dark:text-white'
        }`}
    >
      <span>PotoPic</span>
      <span className="text-slate-900 dark:text-zinc-100 ml-1">ai</span>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-zinc-100 mb-1 ml-0.5 animate-pulse"></span>
    </div>
  );
}
