"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignInModal from './SignInModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const userStr = localStorage.getItem("smartfare_user");
       if (userStr) {
         try {
           const parsed = JSON.parse(userStr);
           if (parsed && parsed.name) {
             setUser(parsed);
             setIsAuthenticated(true);
           }
         } catch(e) {}
       }
       
       if (window.location.search.includes("auth=true")) {
          setShowModal(true);
          router.replace(window.location.pathname);
       }
    }
  }, [router]);

  const handleLogin = () => {
    setShowModal(true);
  };

  const executeLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowModal(false);
    if (typeof window !== 'undefined') {
       localStorage.setItem("smartfare_user", JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowProfile(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("smartfare_user");
      // Don't clear history bindings accidentally here unless specified, just auth
    }
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (supportRef.current && !supportRef.current.contains(event.target as Node)) {
        setShowSupport(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-indigo-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] print:hidden">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Left-aligned Logo */}
        <div className="flex-1">
          <Link href="/" className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            SMARTFARE
          </Link>
        </div>
        
        {/* Centered Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8 font-sans text-sm font-medium tracking-tight">
          <Link href="/" className="text-indigo-200/70 hover:text-white transition-colors">
            Home
          </Link>
          <button 
            onClick={(e) => {
              if(!isAuthenticated) {
                e.preventDefault();
                setShowModal(true);
              } else {
                router.push("/bookings");
              }
            }}
            className="text-indigo-200/70 hover:text-white transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer"
          >
            My Bookings
          </button>
          <Link href="/support" className="text-indigo-200/70 hover:text-white transition-colors">
            Support
          </Link>
        </div>

        {/* Right-aligned Dropdowns */}
        <div className="flex-1 flex justify-end items-center gap-4">
          
          {/* Quick Support */}
          <div className="relative hidden md:block" ref={supportRef}>
            <button 
              className={`p-2 rounded-lg transition-all duration-300 ${showSupport ? 'bg-white/20 text-white' : 'text-indigo-200/70 hover:bg-white/10 hover:text-white'}`}
              onClick={() => {
                setShowSupport(!showSupport);
                setShowNotifications(false);
                setShowProfile(false);
              }}
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <AnimatePresence>
              {showSupport && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-5 z-50 text-slate-800"
                >
                  <h3 className="font-bold border-b border-slate-100 pb-3 mb-3 text-sm">Quick Links</h3>
                  <div className="flex flex-col gap-1 mb-5">
                    <Link href="/baggage" onClick={()=>setShowSupport(false)} className="flex items-center gap-3 px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">luggage</span> Baggage Policy
                    </Link>
                    <Link href="/refunds" onClick={()=>setShowSupport(false)} className="flex items-center gap-3 px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">currency_exchange</span> Cancellation & Refunds
                    </Link>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Emergency Contact 24/7</p>
                    <p className="text-sm font-black text-slate-800">1800-SMART-FLY</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative hidden md:block" ref={notifRef}>
                <button 
                  className={`p-2 rounded-lg transition-all duration-300 ${showNotifications ? 'bg-white/20 text-white' : 'text-indigo-200/70 hover:bg-white/10'}`}
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfile(false);
                  }}
                >
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-outline-variant/20 p-4 z-50 text-center text-sm">
                    <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-outline">notifications_off</span>
                    </div>
                    <p className="font-bold text-on-surface">No new notifications</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>

              
              {/* Profile */}
              <div className="relative hidden lg:block" ref={profileRef}>
                <div 
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-full border cursor-pointer transition-colors bg-white/5 ${showProfile ? 'border-white ring-2 ring-primary/50' : 'border-indigo-200/30 hover:border-white hover:bg-white/10'}`}
                  onClick={() => {
                    setShowProfile(!showProfile);
                    setShowNotifications(false);
                  }}
                >
                  <p className="text-white text-sm font-bold pl-1 tracking-tight">{user?.name || "Traveler"}</p>
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="User profile"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM64ASeEkDlf9p_ZkoEIrgB49E82O8R7g0Q1gmbtaNClzisQB4D2XMmi-HKsr2-XBfyjkvhH5ASIQSJE-QstWw2SoeE5uF9PUwrN0yTY_UhJHFq6l_eQtSTJKBMv9Nkmn6syZ8BBtyq9LoguC2e_bxZcuWruGH9XQkockY8hupjY6LHHYSg7B5nrhzJVuESMkROb3jGrEPeTGamLYk5yYEnJj1686HJ-4IatT7IXv-40SUe3psD5sx3Anq117Fcv4N9p1wF8EL5bo"
                    />
                  </div>
                </div>
                
                {showProfile && (
                  <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50">
                    <div className="px-5 py-4 bg-slate-50 border-b border-outline-variant/20 text-left">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Welcome back</p>
                      <p className="font-black text-slate-900 text-base">{user?.name || "Traveler"}</p>
                      <p className="text-xs text-slate-500 font-medium">{user?.email || "No Email"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Link 
                        href="/profile" 
                        onClick={() => setShowProfile(false)} 
                        className="px-4 py-3 text-sm text-left hover:bg-surface-container transition-colors flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        View Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-outline-variant/20"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={handleLogin}
                className="text-white hover:text-indigo-200 transition-colors font-semibold text-sm px-4 py-2"
              >
                Sign In
              </button>
              <button 
                onClick={handleLogin}
                className="bg-white text-indigo-900 hover:bg-indigo-100 transition-colors font-bold text-sm px-5 py-2 rounded-full shadow-lg"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Default Toggle */}
          {!isAuthenticated && (
            <button 
               onClick={handleLogin}
               className="lg:hidden ml-2 bg-primary px-5 py-2 rounded-full text-white font-semibold text-sm active:scale-95 transition-transform shadow-lg shadow-primary/30"
            >
              Log In
            </button>
          )}
          {isAuthenticated && (
            <div 
              className="lg:hidden h-8 w-8 ml-2 rounded-full overflow-hidden border border-white cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
               <img
                  className="w-full h-full object-cover"
                  alt="User profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM64ASeEkDlf9p_ZkoEIrgB49E82O8R7g0Q1gmbtaNClzisQB4D2XMmi-HKsr2-XBfyjkvhH5ASIQSJE-QstWw2SoeE5uF9PUwrN0yTY_UhJHFq6l_eQtSTJKBMv9Nkmn6syZ8BBtyq9LoguC2e_bxZcuWruGH9XQkockY8hupjY6LHHYSg7B5nrhzJVuESMkROb3jGrEPeTGamLYk5yYEnJj1686HJ-4IatT7IXv-40SUe3psD5sx3Anq117Fcv4N9p1wF8EL5bo"
                />
            </div>
          )}
        </div>
      </div>
    </nav>
      
    {/* Authentication Modal Logic */}
    <AnimatePresence>
      {showModal && (
        <SignInModal 
          onClose={() => setShowModal(false)}
          onLogin={executeLogin}
        />
      )}
    </AnimatePresence>
    </>
  );
}
