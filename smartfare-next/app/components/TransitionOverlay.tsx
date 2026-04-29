"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TransitionOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-50/40 backdrop-blur-xl overflow-hidden"
        >
          {/* Animated Background Clouds */}
          <motion.div 
            initial={{ x: "100vw", opacity: 0.6 }}
            animate={{ x: "-100vw", opacity: 0.9 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-[15%] text-white w-[500px] drop-shadow-md z-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-2.222 1.623-4.07 3.754-4.425C16.891 7.202 14.195 5 11 5 7.134 5 4 8.134 4 12c0 .487.051.961.144 1.417C2.33 13.791 1 15.422 1 17.5 1 20.538 3.462 23 6.5 23h11c2.485 0 4.5-2.015 4.5-4.5S19.985 19 17.5 19z" />
            </svg>
          </motion.div>
          
          <motion.div 
            initial={{ x: "100vw", opacity: 0.4 }}
            animate={{ x: "-100vw", opacity: 0.7 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear", delay: 4 }}
            className="absolute bottom-[20%] text-white w-[650px] drop-shadow-sm z-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-2.222 1.623-4.07 3.754-4.425C16.891 7.202 14.195 5 11 5 7.134 5 4 8.134 4 12c0 .487.051.961.144 1.417C2.33 13.791 1 15.422 1 17.5 1 20.538 3.462 23 6.5 23h11c2.485 0 4.5-2.015 4.5-4.5S19.985 19 17.5 19z" />
            </svg>
          </motion.div>

          <motion.div 
             initial={{ x: "100vw", opacity: 0.7 }}
             animate={{ x: "-100vw", opacity: 0.9 }}
             transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 2 }}
             className="absolute top-[55%] text-white w-[350px] drop-shadow-md z-0"
          >
             <svg viewBox="0 0 24 24" fill="currentColor">
               <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-2.222 1.623-4.07 3.754-4.425C16.891 7.202 14.195 5 11 5 7.134 5 4 8.134 4 12c0 .487.051.961.144 1.417C2.33 13.791 1 15.422 1 17.5 1 20.538 3.462 23 6.5 23h11c2.485 0 4.5-2.015 4.5-4.5S19.985 19 17.5 19z" />
             </svg>
          </motion.div>

          {/* Core Floating Plane */}
          <div className="relative flex flex-col items-center z-20">
             <motion.div
               animate={{ y: [-15, 15, -15] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="text-white relative"
             >
               {/* Soft outer glow */}
               <div className="absolute inset-0 bg-white/60 blur-[30px] rounded-full scale-150"></div>
               
               {/* Sharp SVG icon */}
               <span 
                 className="material-symbols-outlined text-[10rem] relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]" 
                 style={{ fontVariationSettings: "'FILL' 1", transform: "rotate(45deg)" }}
               >
                 flight
               </span>
             </motion.div>
             
             {/* Loading Text */}
             <motion.div
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.6 }}
               className="mt-16 text-center bg-white/50 px-10 py-5 rounded-3xl backdrop-blur-md shadow-sm border border-white/60"
             >
               <h2 className="text-3xl font-black text-blue-950 tracking-widest uppercase mb-3 font-sans">Analyzing Routes</h2>
               <div className="flex justify-center gap-3 mt-4">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></motion.div>
               </div>
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
