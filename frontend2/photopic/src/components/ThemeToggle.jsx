import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else {
      // If system, toggle based on current system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-palette-teal-800 transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
