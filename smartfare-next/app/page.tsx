"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransitionOverlay from "./components/TransitionOverlay";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AIRPORTS = [
  { code: "VTZ", name: "Visakhapatnam" },
  { code: "DEL", name: "Delhi" },
  { code: "BOM", name: "Mumbai" },
  { code: "BLR", name: "Bengaluru" },
  { code: "HYD", name: "Hyderabad" },
  { code: "MAA", name: "Chennai" },
  { code: "CCU", name: "Kolkata" },
];

export default function Home() {
  const router = useRouter();
  
  const [tripType, setTripType] = useState<"round-trip" | "one-way" | "multi-city">("round-trip");

  // Primary Row State
  const [fromAirport, setFromAirport] = useState("VTZ");
  const [toAirport, setToAirport] = useState("BOM");
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  // Secondary Row State (for Multi-City)
  const [from2, setFrom2] = useState("BOM");
  const [to2, setTo2] = useState("DEL");
  const [date2, setDate2] = useState<Date | null>(null);

  // Mount Date Bindings Hiding Hydration Matches
  useEffect(() => {
    setDepartureDate(new Date());
    setReturnDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000));
    setDate2(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));
  }, []);

  const [passengers, setPassengers] = useState({ Adult: 1, Senior: 0, Child: 0, Infant: 0 });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const passengerRef = useRef<HTMLDivElement>(null);

  // Persistence Hook
  useEffect(() => {
    // Mount phase -> Retrieve cache
    if (typeof window !== "undefined") {
      const savedFrom = localStorage.getItem("smartfare_from");
      const savedTo = localStorage.getItem("smartfare_to");
      if (savedFrom && AIRPORTS.some(a => a.code === savedFrom)) {
        setFromAirport(savedFrom);
      }
      if (savedTo && AIRPORTS.some(a => a.code === savedTo)) {
        setToAirport(savedTo);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPassengers = Object.values(passengers).reduce((a, b) => a + b, 0);

  const [isSearching, setIsSearching] = useState(false);
  const handleSearch = () => {
    // Persist explicit tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("smartfare_from", fromAirport);
      localStorage.setItem("smartfare_to", toAirport);
    }

    const searchParams = new URLSearchParams({
      from: fromAirport,
      to: toAirport,
      adults: passengers.Adult.toString(),
      seniors: passengers.Senior.toString(),
      children: passengers.Child.toString(),
      infants: passengers.Infant.toString(),
      trip: tripType
    });
    
    setIsSearching(true);
    setTimeout(() => {
      router.push(`/flights?${searchParams.toString()}`);
    }, 50);
  };

  const updatePassenger = (type: keyof typeof passengers, increment: boolean) => {
    setPassengers((prev) => {
      const current = prev[type];
      if (increment) {
        return { ...prev, [type]: current + 1 };
      } else {
        return { ...prev, [type]: Math.max(type === "Adult" ? 1 : 0, current - 1) };
      }
    });
  };

  return (
    <>
      <TransitionOverlay isVisible={isSearching} />
      <main className="relative pt-12 pb-32 px-4 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Aesthetic */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-75 scale-105 blur-sm"
            alt="Modern airplane wing soaring through a vibrant sunset sky"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv6PtPHlMWw3HgGPmf8vPP6YjqwCCp3KOlXMcXZsJjtZXxCLynWuYarZSKqluXFEBa3x-hAZltjw49BuJXSEQn_7Ls0khKxbR11C7wIpQf7ahQJ50RgskMQ7VFKQ9HkeyzV1vizazFY3n_Ts0O0xoQmjHg2XWCnllfIzcNlDQHmk1066Z8a_dXupF6kZZ6bCHDcU8xvncszpk_-fCcuDDIZ3A3iemkmwHwf0is-E2KaATPOcTZYl79NCg3VpTPKhYBiddCtCVEfUM"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-surface/10 to-surface"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl lg:mt-10 mt-20">
          {/* Hero Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-md">
              Where to next?
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              The future of flight booking. Seamless, smart, and purely premium.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="relative z-50 glass-card rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/40 bg-white/10 backdrop-blur-md">
            
            {/* Flight Type Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setTripType("round-trip")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md whitespace-nowrap
                  ${tripType === "round-trip" ? "bg-primary text-white" : "bg-surface-container-high/80 text-on-surface-variant hover:bg-white"}`}
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                <span>Round-trip</span>
              </button>
              <button 
                onClick={() => setTripType("one-way")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap
                  ${tripType === "one-way" ? "bg-primary text-white shadow-md" : "bg-surface-container-high/80 text-on-surface-variant hover:bg-white"}`}
              >
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
                <span>One-way</span>
              </button>
              <button 
                onClick={() => setTripType("multi-city")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap
                  ${tripType === "multi-city" ? "bg-primary text-white shadow-md" : "bg-surface-container-high/80 text-on-surface-variant hover:bg-white"}`}
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Multi-city</span>
              </button>
            </div>

            {/* Main Form Rows Container */}
            <div className="space-y-4">
              
              {/* PRIMARY ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-white/90 p-4 rounded-3xl">
                {/* From Field */}
                <div className="lg:col-span-3 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10">
                    <span className="material-symbols-outlined">flight_takeoff</span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full pl-12 pr-4 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold transition-all peer appearance-none cursor-pointer"
                      id="fromInput"
                      value={fromAirport}
                      onChange={(e) => setFromAirport(e.target.value)}
                    >
                      {AIRPORTS.map(apt => (
                        <option key={apt.code} value={apt.code}>
                          {apt.name} ({apt.code})
                        </option>
                      ))}
                    </select>
                    <label
                      className="absolute left-12 top-2 text-[10px] font-black uppercase tracking-wider text-outline transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary"
                      htmlFor="fromInput"
                    >
                      From
                    </label>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="lg:col-span-1 flex justify-center -my-2 lg:my-0 lg:-mx-2 z-20">
                  <button 
                    className="bg-white text-primary p-3 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-surface-container-highest active:rotate-180 transition-transform duration-500 hover:scale-110"
                    onClick={() => {
                      const temp = fromAirport;
                      setFromAirport(toAirport);
                      setToAirport(temp);
                    }}
                  >
                    <span className="material-symbols-outlined">swap_horiz</span>
                  </button>
                </div>

                {/* To Field */}
                <div className="lg:col-span-3 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10">
                    <span className="material-symbols-outlined">flight_land</span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full pl-12 pr-4 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold transition-all peer appearance-none cursor-pointer"
                      id="toInput"
                      value={toAirport}
                      onChange={(e) => setToAirport(e.target.value)}
                    >
                      {AIRPORTS.map(apt => (
                        <option key={apt.code} value={apt.code}>
                          {apt.name} ({apt.code})
                        </option>
                      ))}
                    </select>
                    <label
                      className="absolute left-12 top-2 text-[10px] font-black uppercase tracking-wider text-outline transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary"
                      htmlFor="toInput"
                    >
                      To
                    </label>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Dates split: Dep & Ret */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative z-50">
                  {/* Dep Date */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                    </div>
                    <DatePicker
                      selected={departureDate}
                      onChange={(date: Date | null) => setDepartureDate(date)}
                      dateFormat="dd MMM, yyyy"
                      minDate={new Date()}
                      className="w-full pl-10 pr-2 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold text-sm transition-all cursor-pointer"
                      id="depDate"
                    />
                    <label className="absolute left-10 top-2 text-[10px] font-black uppercase tracking-wider text-outline pointer-events-none">
                      Departure
                    </label>
                  </div>
                  {/* Ret Date */}
                  <div className={`relative transition-all duration-300 ${tripType === "one-way" ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                    </div>
                    <DatePicker
                      selected={returnDate}
                      onChange={(date: Date | null) => setReturnDate(date)}
                      dateFormat="dd MMM, yyyy"
                      minDate={departureDate || new Date()}
                      className="w-full pl-10 pr-2 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold text-sm transition-all cursor-pointer"
                      id="retDate"
                    />
                    <label className="absolute left-10 top-2 text-[10px] font-black uppercase tracking-wider text-outline pointer-events-none">
                      Return
                    </label>
                  </div>
                </div>
              </div>


              {/* MULTI-CITY SECONDARY ROW */}
              {tripType === "multi-city" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-white/90 p-4 rounded-3xl animate-in slide-in-from-top-4 fade-in duration-300">
                  {/* From Field 2 */}
                  <div className="lg:col-span-3 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10">
                      <span className="material-symbols-outlined">flight_takeoff</span>
                    </div>
                    <div className="relative">
                      <select
                        className="w-full pl-12 pr-4 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold transition-all peer appearance-none cursor-pointer"
                        value={from2}
                        onChange={(e) => setFrom2(e.target.value)}
                      >
                        {AIRPORTS.map(apt => (
                          <option key={`f2-${apt.code}`} value={apt.code}>
                            {apt.name} ({apt.code})
                          </option>
                        ))}
                      </select>
                      <label className="absolute left-12 top-2 text-[10px] font-black uppercase tracking-wider text-outline transition-all">
                        From
                      </label>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Spacer / Non-Swappable */}
                  <div className="lg:col-span-1 hidden lg:flex justify-center -my-2 lg:my-0 lg:-mx-2 z-20">
                     <span className="material-symbols-outlined text-outline">arrow_forward</span>
                  </div>

                  {/* To Field 2 */}
                  <div className="lg:col-span-3 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10">
                      <span className="material-symbols-outlined">flight_land</span>
                    </div>
                    <div className="relative">
                      <select
                        className="w-full pl-12 pr-4 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold transition-all peer appearance-none cursor-pointer"
                        value={to2}
                        onChange={(e) => setTo2(e.target.value)}
                      >
                        {AIRPORTS.map(apt => (
                          <option key={`t2-${apt.code}`} value={apt.code}>
                            {apt.name} ({apt.code})
                          </option>
                        ))}
                      </select>
                      <label className="absolute left-12 top-2 text-[10px] font-black uppercase tracking-wider text-outline transition-all">
                        To
                      </label>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Dep Date 2 */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative z-40">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                      </div>
                      <DatePicker
                        selected={date2}
                        onChange={(date: Date | null) => setDate2(date)}
                        dateFormat="dd MMM, yyyy"
                        minDate={departureDate || new Date()}
                        className="w-full pl-10 pr-2 pt-6 pb-2 bg-surface-container border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl text-on-surface font-bold text-sm transition-all cursor-pointer"
                      />
                      <label className="absolute left-10 top-2 text-[10px] font-black uppercase tracking-wider text-outline pointer-events-none">
                        Departure
                      </label>
                    </div>
                    <div></div> {/* Empty column for alignment */}
                  </div>
                </div>
              )}
              
            </div>

            {/* Bottom Row: Travelers & CTA */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/90 p-4 rounded-3xl opacity-100">
               {/* Travelers Modale Container */}
               <div className="relative w-full md:w-1/3" ref={passengerRef}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div 
                    className="w-full pl-12 pr-4 pt-4 pb-4 bg-surface-container border-2 border-transparent focus-within:border-primary focus-within:ring-0 shadow-inner rounded-xl text-on-surface font-bold transition-all cursor-pointer h-full select-none"
                    onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  >
                    <span className="text-[10px] absolute top-1 left-12 font-black uppercase tracking-wider text-outline">Travelers</span>
                    {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}
                  </div>
                  
                  {/* Passenger Dropdown Box */}
                  {showPassengerDropdown && (
                    <div className="absolute top-[110%] left-0 w-full min-w-[280px] bg-white border border-outline-variant/30 rounded-xl shadow-lg shadow-black/10 z-[999] p-4 font-sans text-on-surface">
                      {(Object.entries(passengers) as [keyof typeof passengers, number][]).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center mb-4 last:mb-0">
                          <div>
                            <div className="font-bold text-sm tracking-tight">{type}</div>
                            <div className="text-[10px] text-outline">
                              {type === "Adult" && "12+ yrs"}
                              {type === "Senior" && "65+ yrs"}
                              {type === "Child" && "2-11 yrs"}
                              {type === "Infant" && "0-2 yrs"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center disabled:opacity-50 disabled:border-outline-variant disabled:text-outline-variant hover:bg-primary/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); updatePassenger(type, false); }}
                              disabled={type === "Adult" ? count <= 1 : count <= 0}
                            >
                              -
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{count}</span>
                            <button 
                              className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); updatePassenger(type, true); }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              {/* Flex Options */}
              <div className="flex items-center gap-6 text-on-surface flex-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-5 h-5 rounded-md border-2 border-outline-variant text-primary focus:ring-primary/20" type="checkbox" />
                  <span className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Direct flights</span>
                </label>
              </div>

              {/* Search CTA */}
              <button
                onClick={handleSearch}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">search</span>
                Search Flights
              </button>
            </div>
          </div>

          {/* Bento Features Below Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-16">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 hover:bg-white transition-all shadow-xl shadow-black/5 group">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h4 className="font-bold text-on-surface mb-1">Smart Prediction</h4>
              <p className="text-sm text-on-surface-variant">AI-powered price tracking to find the best time to book.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 hover:bg-white transition-all shadow-xl shadow-black/5 group">
              <div className="bg-secondary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
              </div>
              <h4 className="font-bold text-on-surface mb-1">Elite Comfort</h4>
              <p className="text-sm text-on-surface-variant">Exclusive lounge access and premium seat selections.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 hover:bg-white transition-all shadow-xl shadow-black/5 group">
              <div className="bg-tertiary-container/10 w-12 h-12 rounded-2xl flex items-center justify-center text-tertiary-container mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
              </div>
              <h4 className="font-bold text-on-surface mb-1">Zero Fees</h4>
              <p className="text-sm text-on-surface-variant">Transparent pricing with absolutely no hidden booking fees.</p>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden">
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-indigo-950/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex justify-around items-center px-4 pb-6 pt-3 rounded-t-3xl">
          <Link className="flex flex-col items-center justify-center bg-indigo-500/20 text-white rounded-xl px-4 py-2" href="/">
            <span className="material-symbols-outlined">flight_takeoff</span>
            <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest mt-1">Search</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-indigo-300/50 hover:text-indigo-200 transition-all" href="/bookings">
            <span className="material-symbols-outlined">luggage</span>
            <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest mt-1">Trips</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-indigo-300/50 hover:text-indigo-200 transition-all" href="/support">
             <span className="material-symbols-outlined">help_outline</span>
            <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest mt-1">Support</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-indigo-300/50 hover:text-indigo-200 transition-all" href="/">
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest mt-1">Profile</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
