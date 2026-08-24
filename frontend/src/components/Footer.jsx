import { Logo } from './Logo';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <Logo />
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
              The AI-powered delivery platform for modern event photographers. Stop sorting, start delivering.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-palette-teal-500 hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-black mb-6">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Face Matching AI', 'Pricing', 'Testimonials', 'Changelog'].map((item, i) => (
                <li key={i}><a href="#" className="text-slate-500 font-medium hover:text-palette-teal-900 transition-colors relative group inline-block">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-palette-teal-500/50 transition-all duration-300 group-hover:w-full"></span>
                </a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-black mb-6">Resources</h4>
            <ul className="space-y-4">
              {['Help Center', 'API Documentation', 'Community Forum', 'Creator Blog', 'Webinars'].map((item, i) => (
                <li key={i}><a href="#" className="text-slate-500 font-medium hover:text-palette-teal-900 transition-colors relative group inline-block">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-palette-teal-500/50 transition-all duration-300 group-hover:w-full"></span>
                </a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-black mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Legal', 'Privacy Policy', 'Contact'].map((item, i) => (
                <li key={i}><a href="#" className="text-slate-500 font-medium hover:text-palette-teal-900 transition-colors relative group inline-block">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-palette-teal-500/50 transition-all duration-300 group-hover:w-full"></span>
                </a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 font-medium text-sm">
            © {new Date().getFullYear()} Privapic Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
