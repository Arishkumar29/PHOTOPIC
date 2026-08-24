import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle2, User, ArrowRight, X, Camera, Zap, Lock, Share2, Users, Archive } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

export function LandingPage({ onStart }) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 dark:text-zinc-50 overflow-x-hidden selection:bg-slate-200">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-[1400px] mx-auto">
        <Logo onClick={onStart} />
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-zinc-100">
          <a href="#" className="hover:opacity-60 transition-opacity">Get Started</a>
          <a href="#" className="hover:opacity-60 transition-opacity">Features</a>
          <a href="#" className="hover:opacity-60 transition-opacity">Membership</a>
          <a href="#" className="hover:opacity-60 transition-opacity">Contact</a>
          <a href="#" className="hover:opacity-60 transition-opacity">Solution</a>
        </div>
        
        <div className="flex items-center gap-4">
           <ThemeToggle />
           <button onClick={onStart} className="hover:opacity-60 transition-opacity text-slate-900 dark:text-zinc-100"><User className="w-5 h-5" /></button>
           <button className="hover:opacity-60 transition-opacity text-sm font-bold text-slate-900 dark:text-zinc-100">0</button>
        </div>
      </nav>

      {/* Hero 1 */}
      <div className="pt-12 sm:pt-20 pb-16 px-6 text-center max-w-[1400px] mx-auto flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-[5.5rem] font-medium tracking-tight leading-[1.05] text-slate-900 dark:text-zinc-50 max-w-4xl mb-8 sm:mb-12"
        >
          A place to organize your <span className="text-slate-400 dark:text-zinc-500">moments.</span>
        </motion.h1>
        
        <div className="relative w-full max-w-4xl h-[320px] sm:h-[400px] flex items-center justify-center mb-12">
          {/* Card 1 (Far Left) */}
          <motion.div 
            initial={{ y: 200, x: 0, rotate: 0, opacity: 0, scale: 0.8 }} 
            animate={{ y: 40, x: -280, rotate: -20, opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.1 }} 
            className="absolute z-10 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 hidden lg:block bg-red-400"
          >
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80" alt="Card" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@sarah</div>
          </motion.div>
          
          {/* Card 2 (Left) */}
          <motion.div 
            initial={{ y: 200, x: 0, rotate: 0, opacity: 0, scale: 0.8 }} 
            animate={{ y: 10, x: -140, rotate: -10, opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.15 }} 
            className="absolute z-20 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 hidden sm:block bg-blue-400"
          >
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80" alt="Card" className="w-full h-full object-cover" />
          </motion.div>
          
          {/* Card 3 (Center) */}
          <motion.div 
            initial={{ y: 200, x: 0, rotate: 0, opacity: 0, scale: 0.8 }} 
            animate={{ y: -20, x: 0, rotate: 0, opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.2 }} 
            className="absolute z-30 w-44 sm:w-64 h-56 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 bg-slate-900 dark:bg-zinc-950"
          >
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80" alt="Card" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-2xl sm:text-4xl transform -rotate-12">FACE AI</span>
            </div>
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@mike</div>
          </motion.div>
          
          {/* Card 4 (Right) */}
          <motion.div 
            initial={{ y: 200, x: 0, rotate: 0, opacity: 0, scale: 0.8 }} 
            animate={{ y: 10, x: 140, rotate: 10, opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.25 }} 
            className="absolute z-20 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 hidden sm:block bg-green-500"
          >
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80" alt="Card" className="w-full h-full object-cover" />
          </motion.div>
          
          {/* Card 5 (Far Right) */}
          <motion.div 
            initial={{ y: 200, x: 0, rotate: 0, opacity: 0, scale: 0.8 }} 
            animate={{ y: 40, x: 280, rotate: 20, opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.3 }} 
            className="absolute z-10 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 hidden lg:block bg-purple-500"
          >
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80" alt="Card" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@andrea</div>
          </motion.div>
        </div>

        <p className="text-slate-500 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Creatives can organize their masterpieces, and clients can discover and securely view galleries.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={onStart} 
            className="group relative overflow-hidden bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-base tracking-wide px-9 py-4.5 rounded-full hover-shine glow-btn-dark hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Hero 2 - Showcase */}
      <div className="py-16 sm:py-24 px-6 max-w-[1400px] mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tight leading-[1.05] text-slate-900 dark:text-zinc-50 max-w-4xl mx-auto mb-10 sm:mb-16"
        >
          Capture, <span className="text-red-500 opacity-80">Organize</span>, & share moments to our platform.
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto text-left">
           <motion.div
             initial={{ opacity: 0, x: -45 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
           >
             <p className="text-slate-500 dark:text-zinc-400 text-base sm:text-xl leading-relaxed">
               Dynamic platform where photographers and clients seamlessly merge. GWC Face AI brings together creators and enthusiasts to share creativity.
             </p>
           </motion.div>
           
           <div className="relative h-[300px] sm:h-[400px]">
             {/* Collage of images */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, type: "spring" }}
               className="absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-red-500 z-20 shadow-xl hidden sm:block"
             >
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                <div className="absolute top-3 left-3 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-xs font-bold px-3 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@howard</div>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 50 }}
               whileInView={{ opacity: 1, scale: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, type: "spring", delay: 0.1 }}
               className="absolute bottom-0 left-0 sm:left-10 w-44 sm:w-56 h-52 sm:h-64 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-blue-500 z-10 shadow-xl"
             >
                <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
               className="absolute top-16 right-0 sm:left-40 w-32 sm:w-40 h-44 sm:h-56 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-green-500 z-30 shadow-xl border-4 border-white dark:border-zinc-900"
             >
                <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-xs font-bold px-3 py-1 rounded-full border border-slate-100 dark:border-zinc-800">@robin</div>
             </motion.div>
           </div>
        </div>
      </div>

      {/* Gateway Section (Orange Background Hero) */}
      <div className="px-6 pb-24 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-bold tracking-widest uppercase mb-4 text-slate-500 dark:text-zinc-400">Class by Creatives © 2026</div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tight mb-8 text-slate-900 dark:text-zinc-50">
            Gateway to<br/>creative people.
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-[1.75rem] sm:rounded-[3rem] overflow-hidden bg-[#ff5e3a]"
        >
          <div className="absolute inset-0 flex items-center overflow-hidden opacity-80 mix-blend-overlay">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              className="flex h-full min-w-max"
            >
              {[1, 2].map((set) => (
                <div key={set} className="flex h-full">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80" className="h-full w-[300px] sm:w-[600px] md:w-[800px] object-cover" />
                  <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80" className="h-full w-[300px] sm:w-[600px] md:w-[800px] object-cover" />
                  <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80" className="h-full w-[300px] sm:w-[600px] md:w-[800px] object-cover" />
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" className="h-full w-[300px] sm:w-[600px] md:w-[800px] object-cover" />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#ff5e3a]/90 via-[#ff5e3a]/40 to-transparent"></div>
          
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 hidden sm:block">
             <div className="flex flex-col gap-2">
               <div className="w-12 h-6 bg-slate-900 rounded-full border border-white/20 relative">
                 <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
               </div>
               <div className="w-12 h-6 bg-white/20 rounded-full border border-white/20 backdrop-blur-md"></div>
             </div>
          </div>
          
          <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-6 py-2 rounded-full border border-white/30 transition-colors text-sm">
               Watch
             </button>
          </div>
          
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 hidden sm:block">
             <span className="bg-white/90 text-slate-900 text-xs font-bold px-4 py-2 rounded-full">@reatha</span>
          </div>
          
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex gap-2">
             <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-colors">
               <ArrowRight className="w-5 h-5 rotate-180" />
             </button>
             <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-colors">
               <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </motion.div>
      </div>

      {/* Big Text Section */}
      <div className="py-16 sm:py-24 md:py-32 px-6 max-w-5xl mx-auto text-center relative border-t border-slate-200/60 dark:border-zinc-800/40">
        <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-slate-900 dark:text-zinc-50">
          Whether you're a professional looking to organize your work / or hobbyist seeking smart galleries, GWC Face AI <span className="text-slate-400 dark:text-zinc-500">connects you to world of</span> intelligent photography.
        </h2>
        
        {/* Floating elements inside text */}
        <div className="absolute top-1/4 -left-12 hidden lg:block">
           <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xl rounded-full px-4 py-2 font-bold text-sm transform -rotate-12 border border-slate-100 dark:border-zinc-800">@sarah</div>
        </div>
        <div className="absolute bottom-1/4 -right-12 hidden lg:block">
           <div className="bg-blue-500 text-white shadow-xl rounded-full px-4 py-2 font-bold text-sm transform rotate-12">@andrea</div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-12 sm:mt-16">
          <div className="w-12 h-12 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-850 rounded-lg flex items-center justify-center text-slate-900 dark:text-zinc-100"><Zap className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Vision & Cards */}
      <div className="py-12 sm:py-20 md:py-24 px-6 max-w-[1400px] mx-auto border-t border-slate-200/60 dark:border-zinc-800/40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-1">
             <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6 text-slate-900 dark:text-zinc-50">
               Our vision<br/>for any photo<br/>technology.
             </h2>
             <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
               Every photo tells a story. Echoes of Expression allows photographers to showcase their personal journeys through their work.
             </p>
             
             <div className="grid grid-cols-4 gap-4 mt-12 opacity-40 text-slate-900 dark:text-zinc-100">
                <Camera className="w-8 h-8" />
                <Zap className="w-8 h-8" />
                <Lock className="w-8 h-8" />
                <Share2 className="w-8 h-8" />
                <CheckCircle2 className="w-8 h-8" />
                <Search className="w-8 h-8" />
             </div>
          </div>
          
          <div className="lg:col-span-2">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Features</h3>
               <button className="bg-slate-100 dark:bg-zinc-850 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors border border-transparent dark:border-zinc-800">
                 + Create
               </button>
             </div>
             
             <div className="bg-slate-900 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-800 dark:border-zinc-800/60 text-white rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12">
               <h4 className="text-xl font-medium mb-8 border-b border-white/20 pb-4">Personal</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                 {/* Feature Cards */}
                 <div className="bg-slate-800 dark:bg-zinc-800 rounded-3xl aspect-[4/5] overflow-hidden relative group">
                   <div className="absolute inset-0 bg-[#c0ff00] p-6 flex flex-col justify-between mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity z-20">
                     <h5 className="text-black font-bold text-2xl">Smart Capture</h5>
                   </div>
                   <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80" className="w-full h-full object-cover" />
                 </div>
                 
                 <div className="bg-[#ff5e3a] rounded-3xl aspect-[4/5] overflow-hidden p-6 text-white flex flex-col justify-end relative group">
                   <div className="relative z-10">
                     <h5 className="font-bold text-2xl mb-2">AI Face Recognition</h5>
                     <p className="text-sm text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Guests snap a selfie, and our AI instantly finds all their photos in the gallery.</p>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0"></div>
                   <img src="https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 
                 <div className="bg-[#0055ff] rounded-3xl aspect-[4/5] overflow-hidden p-6 text-white flex flex-col justify-end relative">
                   <h5 className="font-bold text-2xl relative z-10">Bank-Grade Privacy</h5>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* AI Face Recognition Demonstration Section */}
      <div className="py-24 px-6 max-w-[1400px] mx-auto">
         <div className="bg-slate-900 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-800 dark:border-zinc-800/60 rounded-[1.75rem] sm:rounded-[3rem] p-5 sm:p-8 md:p-16 overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="max-w-xl relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm mb-6 border border-blue-500/30">
                 <Search className="w-4 h-4" /> Potopic FaceSync
               </div>
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
                 Find your photos in seconds.
               </h2>
               <p className="text-slate-400 text-lg leading-relaxed mb-8">
                 Ditch the infinite scroll. Simply take a selfie and let our client-side indexing engine securely retrieve all your photos from the gallery instantly.
               </p>
               <button 
                 onClick={onStart} 
                 className="group relative overflow-hidden bg-gradient-to-r from-slate-950 to-zinc-900 dark:from-white dark:to-zinc-100 text-white dark:text-zinc-900 font-extrabold text-lg px-10 py-5 rounded-full hover-shine glow-btn-dark hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
               >
                 <span>Try Face Recognition</span>
                 <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
               </button>
            </div>

            {/* Animation Container */}
            <div className="w-full md:w-1/2 relative h-[300px] sm:h-[400px] bg-slate-800/80 dark:bg-zinc-900/80 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-700 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-4 sm:p-8">
               
               {/* Main Subject Photo */}
               <div className="relative w-32 sm:w-48 h-44 sm:h-64 rounded-2xl overflow-hidden shadow-2xl z-20 border-4 border-slate-700">
                 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" alt="Subject" className="w-full h-full object-cover" />
                 
                 {/* Scanning Overlay (Framer Motion) */}
                 <motion.div 
                   animate={{ y: ["0%", "256px", "0%"] }} 
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] z-30"
                 />
                 <motion.div 
                   animate={{ opacity: [0, 0.2, 0] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 bg-blue-500 mix-blend-overlay z-20"
                 />
                 {/* Face Bounding Box */}
                 <motion.div 
                   animate={{ opacity: [0, 1, 1, 0] }}
                   transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.8, 1], ease: "linear" }}
                   className="absolute top-[20%] left-[25%] w-[50%] h-[40%] border-2 border-blue-400 rounded-lg z-30"
                 >
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white"></div>
                 </motion.div>
               </div>

               {/* Background Photos (Matches) */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, x: 50 }}
                 whileInView={{ opacity: 1, scale: 1, x: 0 }}
                 transition={{ delay: 0.5, duration: 0.5 }}
                 className="absolute top-4 right-4 sm:top-10 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 rounded-xl overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10"
               >
                 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 border-4 border-blue-500 rounded-xl z-20 pointer-events-none"></div>
                 <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-30">MATCH</div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, x: -50, y: 50 }}
                 whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                 transition={{ delay: 1, duration: 0.5 }}
                 className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 w-28 sm:w-40 h-20 sm:h-28 rounded-xl overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10"
               >
                 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 border-4 border-blue-500 rounded-xl z-20 pointer-events-none"></div>
                 <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-30">MATCH</div>
               </motion.div>

               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            </div>
         </div>
      </div>

      {/* Faces Grid Section */}
      <div className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#f9f9f9] dark:bg-zinc-900/40 text-center overflow-hidden rounded-[1.75rem] sm:rounded-[3rem] mx-2 sm:mx-6 border border-slate-100 dark:border-zinc-800/40">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-medium tracking-tight mb-4 text-slate-900 dark:text-zinc-50">
            You will find yourself<br/>among <span className="font-serif italic text-slate-400 dark:text-zinc-500">us</span>
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 mb-8 sm:mb-12">Dive into a dynamic community where creatives seamlessly merge.</p>
        </div>
        
        {/* Massive grid of avatars */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[1400px] mx-auto mt-12 opacity-80">
           {[...Array(24)].map((_, i) => (
             <div key={i} className={`rounded-[1.25rem] sm:rounded-3xl overflow-hidden shadow-sm hover:scale-105 transition-transform ${i % 3 === 0 ? 'w-14 h-14 sm:w-24 sm:h-24' : i % 5 === 0 ? 'w-18 h-18 sm:w-32 sm:h-32' : 'w-10 h-10 sm:w-20 sm:h-20'}`}>
               <img src={`https://i.pravatar.cc/150?img=${i + 10}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
             </div>
           ))}
        </div>
      </div>

      {/* Pricing / Membership */}
      <div className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 bg-slate-50 dark:bg-zinc-900/40 rounded-[1.75rem] sm:rounded-[3rem] p-6 sm:p-12 border border-slate-100 dark:border-zinc-800/40">
           <div className="max-w-xl">
             <div className="w-12 h-12 bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
               <div className="w-6 h-6 border-4 border-slate-900 dark:border-zinc-100 rounded-sm"></div>
             </div>
             <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4 text-slate-900 dark:text-zinc-50">Membership is Free</h2>
             <p className="text-slate-500 dark:text-zinc-400 text-sm sm:text-lg">Offering creatives a chance to own their narrative without any barriers. This platform is where stories come alive through art, completely free of charge.</p>
           </div>
           
           <div className="flex-shrink-0">
              <button 
                onClick={onStart} 
                className="group relative overflow-hidden bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-base tracking-wide px-10 py-5 rounded-full hover-shine glow-btn-dark hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Start for Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
        </div>
        
        {/* Marquee-style text banner */}
        <div className="bg-[#c0ff00] rounded-[1.75rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 text-center overflow-hidden relative">
           <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight whitespace-normal md:whitespace-nowrap overflow-hidden text-ellipsis text-black relative z-10">
             Creatives can organize 📸 Inspired by people 🎁 New Photo Platform
           </h2>
           <div className="absolute inset-0 pointer-events-none grid grid-cols-8 grid-rows-3 gap-8 opacity-20 p-8">
             {[...Array(24)].map((_, i) => (
               <div key={i} className="w-8 h-8 flex items-center justify-center">
                 {i % 2 === 0 ? <Camera className="w-full h-full text-black"/> : <Lock className="w-full h-full text-black"/>}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Footer / CTA Cards */}
      <div className="py-16 px-6 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-gradient-to-br from-[#ff0055] to-[#cc0044] rounded-[1.75rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-16 text-white relative overflow-hidden group shadow-xl">
            <div className="relative z-10 max-w-md">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border border-white/30 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6 leading-tight">Meet<br/>new people</h3>
              <p className="text-base sm:text-lg opacity-90 mb-10 font-medium leading-relaxed">
                Connect with creatives and enthusiasts. Share, discover, and organize unique moments together in our vibrant community.
              </p>
              <button 
                onClick={onStart} 
                className="group relative overflow-hidden bg-white text-[#ff0055] font-extrabold px-8 py-4 rounded-full text-base sm:text-lg hover-shine hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <span>Let's Meet</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80" className="absolute top-0 right-0 h-full w-2/3 object-cover mix-blend-multiply opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700 origin-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff0055] via-[#ff0055]/80 to-transparent z-0"></div>
         </div>
         
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[1.75rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-16 text-white relative overflow-hidden group shadow-xl">
            <div className="relative z-10 max-w-md">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <Archive className="w-7 h-7" />
              </div>
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6 leading-tight">Archive<br/>memories</h3>
              <p className="text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
                GWC Face AI is the platform where creatives ride the wave of creativity, showcasing their work to a broad and engaged audience.
              </p>
              <button 
                onClick={onStart} 
                className="group relative overflow-hidden bg-white text-slate-950 font-extrabold px-8 py-4 rounded-full text-base sm:text-lg hover-shine hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <span>Archive Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
            <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80" className="absolute top-0 right-0 h-full w-2/3 object-cover opacity-30 mix-blend-luminosity group-hover:opacity-50 group-hover:scale-110 transition-all duration-700 origin-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-0"></div>
         </div>
      </div>
      
      {/* Footer Text */}
      <div className="px-6 py-16 max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start border-t border-slate-200 dark:border-zinc-800 mt-12 gap-12">
         <div className="max-w-xs">
           <h4 className="text-2xl font-bold mb-4 text-slate-900 dark:text-zinc-50">Our platform, your art.</h4>
           <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">In the realm of fitness, creativity knows no bounds. GWC Face AI celebrates the timeless nature of photography.</p>
           <div className="flex gap-4 opacity-30 text-slate-900 dark:text-zinc-100">
             <div className="w-8 h-8 rounded-full border border-slate-900 dark:border-zinc-100 flex items-center justify-center font-bold">in</div>
             <div className="w-8 h-8 rounded-full border border-slate-900 dark:border-zinc-100 flex items-center justify-center font-bold">tw</div>
             <div className="w-8 h-8 rounded-full border border-slate-900 dark:border-zinc-100 flex items-center justify-center font-bold">ig</div>
             <div className="w-8 h-8 rounded-full border border-slate-900 dark:border-zinc-100 flex items-center justify-center font-bold">fb</div>
           </div>
         </div>
         
         <div className="flex flex-wrap gap-16 text-sm">
            <div className="flex flex-col gap-4 font-semibold text-slate-700 dark:text-zinc-300">
              <div className="text-slate-400 dark:text-zinc-500 mb-2 font-bold uppercase tracking-wider text-xs">Platform</div>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Get Started</a>
              <a href="#" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">Create strategy <span className="bg-[#ff5e3a] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">New</span></a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Membership</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Solution</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">E-Commerce</a>
            </div>
            <div className="flex flex-col gap-4 font-semibold text-slate-700 dark:text-zinc-300">
              <div className="text-slate-400 dark:text-zinc-500 mb-2 font-bold uppercase tracking-wider text-xs">Resources</div>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Your Story</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Create Story</a>
              <a href="#" className="text-slate-400 dark:text-zinc-555">Sell test <span className="bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Soon</span></a>
            </div>
            <div className="flex flex-col gap-4 font-semibold text-slate-700 dark:text-zinc-300">
              <div className="text-slate-400 dark:text-zinc-500 mb-2 font-bold uppercase tracking-wider text-xs">Company</div>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy & Policy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact Us</a>
              <a href="#" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">Api <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">New</span></a>
            </div>
         </div>
      </div>
      
      <div className="text-center text-xs text-slate-400 dark:text-zinc-500 pb-12 pt-4 border-t border-slate-100 dark:border-zinc-900 max-w-[1400px] mx-auto">
        © 2026 GWC Face AI. All rights reserved.
      </div>

    </div>
  );
}