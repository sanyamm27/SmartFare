"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Generate realistic Indian flights
const AIRLINES = [
  { name: "IndiGo", code: "6E", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/1200px-IndiGo_Airlines_logo.svg.png" },
  { name: "Air India", code: "AI", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Air_India_Logo_2023.svg/1200px-Air_India_Logo_2023.svg.png" },
  { name: "SpiceJet", code: "SG", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/92/SpiceJet_Logo.svg/1200px-SpiceJet_Logo.svg.png" },
  { name: "Vistara", code: "UK", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Vistara_Logo.svg/1200px-Vistara_Logo.svg.png" },
  { name: "Akasa Air", code: "QP", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Akasa_Air_logo.svg/1200px-Akasa_Air_logo.svg.png" }
];



const generateFlights = (from: string, to: string, dateStr: string) => {
  let baseDate = new Date(dateStr);
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date(); // Fallback if invalid
  }

  const flights = [];
  for (let i = 0; i < 50; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const basePrice = Math.floor(Math.random() * 8000) + 3000; // ₹3000 to ₹11000

    // Assign Stop condition (30% chance of 1 Stop)
    const isOneStop = Math.random() < 0.3;
    const durationMins = isOneStop
      ? Math.floor(Math.random() * 180) + 200 // 200 to 380 mins
      : Math.floor(Math.random() * 120) + 90; // 90 to 210 mins

    // Departure time constraints
    const hour = Math.floor(Math.random() * 24);
    const min = Math.floor(Math.random() * 60);
    const depTimeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

    // Arrival
    const arrTime = new Date(new Date(baseDate).setHours(hour, min) + durationMins * 60000);
    const arrTimeStr = `${arrTime.getHours().toString().padStart(2, '0')}:${arrTime.getMinutes().toString().padStart(2, '0')}`;

    flights.push({
      id: i,
      airline: airline.name,
      flightNo: `${airline.code}-${Math.floor(Math.random() * 900) + 100}`,
      logo: airline.logo,
      aircraft: ["Airbus A320neo", "Boeing 737 MAX", "Airbus A321", "Boeing 787"][Math.floor(Math.random() * 4)],
      dep: { code: from, time: depTimeStr },
      arr: { code: to, time: arrTimeStr },
      durationText: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      durationMins,
      stops: isOneStop ? "1 Stop" : "Non-stop",
      price: basePrice,
      fares: [
        { name: "Economy Saver", price: basePrice },
        { name: "Economy Flex", price: basePrice + 1500 },
        { name: "Premium Cabin", price: basePrice + 4500 }
      ]
    });
  }
  return flights;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

function FlightsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams?.get("from") || "VTZ";
  const to = searchParams?.get("to") || "BOM";
  const tripType = searchParams?.get("trip") || "one-way";
  
  const rawDepartureDate = searchParams?.get("departureDate") || new Date().toISOString();
  const rawReturnDate = searchParams?.get("returnDate") || new Date(Date.now() + 86400000 * 4).toISOString();

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const departureDate = formatDate(rawDepartureDate);
  const returnDate = formatDate(rawReturnDate);

  const adults = parseInt(searchParams?.get("adults") || "1");
  const totalTravelers = adults + parseInt(searchParams?.get("seniors") || "0") + parseInt(searchParams?.get("children") || "0") + parseInt(searchParams?.get("infants") || "0");
  const [depFlights, setDepFlights] = useState<any[]>([]);
  const [retFlights, setRetFlights] = useState<any[]>([]);
  const [selectionStage, setSelectionStage] = useState<'departure' | 'return'>('departure');
  const [isLoading, setIsLoading] = useState(true);

  const [departureFlightFare, setDepartureFlightFare] = useState<{ name: string, price: number, airline: string, fromCode: string, toCode: string } | null>(null);
  const [selectedFare, setSelectedFare] = useState<{ name: string, price: number, airline: string, fromCode: string, toCode: string } | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null);

  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"best" | "price" | "duration">("best");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      const depFlightsGen = generateFlights(from, to, rawDepartureDate);
      setDepFlights(depFlightsGen);
      if (tripType === 'round-trip') {
        setRetFlights(generateFlights(to, from, rawReturnDate));
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const selectFare = (fareName: string, price: number, airline: string, fromCode: string, toCode: string) => {
    if (tripType === 'round-trip' && selectionStage === 'departure') {
      setDepartureFlightFare({ name: fareName, price, airline, fromCode, toCode });
      setSelectionStage('return');
      setSelectedFare(null); // Clear selected for the return pane
      setExpandedFlight(null); // Auto-close expanded flight
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back up to the top gracefully
    } else {
      setSelectedFare({ name: fareName, price, airline, fromCode, toCode });
    }
  };

  const handleCheckout = () => {
    if (selectedFare) {
      const isRound = tripType === 'round-trip';
      const mockFlightId = `${selectedFare.airline.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;

      // Live Total approach: The baseFare is the EXACT total amount shown in the UI for the selected amenities.
      const combinedFare = (departureFlightFare ? departureFlightFare.price : 0) + selectedFare.price;

      const airline = encodeURIComponent(selectedFare.airline);
      const fromCode = departureFlightFare?.fromCode || selectedFare.fromCode || from;
      const toCode = departureFlightFare?.toCode || selectedFare.toCode || to;
      const fareType = encodeURIComponent(selectedFare.name);

      router.push(
        `/book/${mockFlightId}/services?passengers=${totalTravelers}` +
        `&baseFare=${combinedFare}` +
        `&airline=${airline}` +
        `&from=${fromCode}` +
        `&to=${toCode}` +
        `&trip=${isRound ? 'round-trip' : 'one-way'}` +
        `&fareType=${fareType}` +
        `&date=${encodeURIComponent(departureDate)}`
      );
    }
  };

  const toggleAirline = (airlineName: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airlineName)
        ? prev.filter(a => a !== airlineName)
        : [...prev, airlineName]
    );
  };

  const taxes = 840; // Flat ₹840 tax for simulation per flight
  const totalTaxes = departureFlightFare ? taxes * 2 : taxes;
  const combinedFareWithoutTaxes = ((departureFlightFare ? departureFlightFare.price : 0) + (selectedFare ? selectedFare.price : 0)) - totalTaxes;
  const currentTotalAmount = (departureFlightFare ? departureFlightFare.price : 0) + (selectedFare ? selectedFare.price : 0);

  const activeFlights = selectionStage === 'departure' ? depFlights : retFlights;

  // Filter and Sort Computing logic
  const filteredAndSortedFlights = useMemo(() => {
    let result = activeFlights.filter(f => f.price <= maxPrice);

    if (nonStopOnly) {
      result = result.filter(f => f.stops === "Non-stop");
    }

    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airline));
    }

    result.sort((a, b) => {
      if (sortOption === "price") {
        return a.price - b.price;
      } else if (sortOption === "duration") {
        return a.durationMins - b.durationMins;
      } else {
        const scoreA = a.price + (a.durationMins * 10);
        const scoreB = b.price + (b.durationMins * 10);
        return scoreA - scoreB;
      }
    });

    return result;
  }, [activeFlights, maxPrice, nonStopOnly, selectedAirlines, sortOption]);

  const cheapestFlightId = activeFlights.length > 0 ? [...activeFlights].sort((a, b) => a.price - b.price)[0].id : null;
  const bestFlightId = activeFlights.length > 0 ? [...activeFlights].sort((a, b) => (a.price + a.durationMins * 10) - (b.price + b.durationMins * 10))[0].id : null;

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-6 pb-20 pt-8 mt-20">
      {/* Search Info Summary Bar & Selection State Tracker */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 p-4 lg:p-0">
        <div>
          {tripType === 'round-trip' && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${selectionStage === 'departure' ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-700'}`}>
                Step 1: Departure
              </span>
              <span className="material-symbols-outlined text-slate-300 text-[14px]">arrow_forward</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${selectionStage === 'return' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                Step 2: Return
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-1 uppercase">
            {selectionStage === 'departure' ? `${from} to ${to}` : `${to} to ${from}`}
          </h1>
          <p className="text-on-surface-variant text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>{" "}
            {selectionStage === 'departure' ? departureDate : returnDate} • {totalTravelers} Traveler{totalTravelers > 1 ? 's' : ''} • All Classes
          </p>
        </div>
        <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2 px-5 py-2 min-h-[44px] bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors text-sm font-black shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span> Filters
          </button>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:inline-block px-2 border-l border-slate-200">Sort</span>
          <select
            className="bg-white border flex-1 md:w-auto border-outline-variant px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold text-slate-700 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={sortOption}
            onChange={(e: any) => setSortOption(e.target.value)}
          >
            <option value="best">Best Option</option>
            <option value="price">Cheapest Price</option>
            <option value="duration">Fastest Duration</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Slide-in Filter Drawer */}
        <AnimatePresence>
          {isFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
                onClick={() => setIsFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 left-0 bottom-0 w-full max-w-[320px] bg-white z-[210] shadow-2xl p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined">tune</span> Filters
                  </h2>
                  <button onClick={() => setIsFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Section 1: Stops */}
                <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-4">Stops</h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={nonStopOnly}
                      onChange={(e) => setNonStopOnly(e.target.checked)}
                      className="w-5 h-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Non-Stop Only</span>
                  </label>
                </div>

                {/* Section 2: Max Price */}
                <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400">Max Price</h3>
                    <span className="text-sm font-medium text-indigo-600">{formatPrice(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="15000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>₹3,000</span>
                    <span>₹15,000</span>
                  </div>
                </div>

                {/* Section 3: Airlines */}
                <div className="mb-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-4">Airlines</h3>
                  <div className="space-y-4">
                    {AIRLINES.map(airline => (
                      <label key={airline.code} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline.name)}
                          onChange={() => toggleAirline(airline.name)}
                          className="w-5 h-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          <span className="bg-slate-200/60 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-500 w-8 text-center tracking-wider">{airline.code}</span>
                          {airline.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Flight Results Column */}
        <div className="w-full lg:w-9/12 flex flex-col gap-8">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-slate-200 rounded"></div>
                      <div className="w-32 h-3 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-8">
                  <div className="w-16 h-8 bg-slate-200 rounded"></div>
                  <div className="flex-1 h-px bg-slate-200 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-16 h-8 bg-slate-200 rounded"></div>
                  <div className="w-24 h-10 bg-slate-200 rounded-xl ml-8"></div>
                </div>
              </div>
            ))
          ) : filteredAndSortedFlights.length === 0 ? (
            <div className="bg-white rounded-3xl border border-outline-variant/40 p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Flights Found</h3>
              <p className="text-slate-500 font-medium text-sm">We couldn't find any flights for this specific route and date combination. Try adjusting your search parameters.</p>
              {selectionStage === 'return' && departureFlightFare && (
                <button
                  onClick={() => setSelectionStage('departure')}
                  className="mt-6 font-bold text-sm text-indigo-600 border-2 border-indigo-100 hover:border-indigo-600 rounded-xl px-6 py-2 transition-all"
                >
                  Go Back to Departure Flights
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedFlights.slice(0, 20).map((flight) => {
              const isCheapestBadge = flight.id === cheapestFlightId;
              const isBestBadge = flight.id === bestFlightId;

              return (
                <div key={flight.id} className="relative bg-white rounded-2xl overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-indigo-600"></div>

                  {/* Badges -> Moved right-8 inside relative block */}
                  {(isCheapestBadge || isBestBadge) && (
                    <div className="absolute top-0 right-4 lg:right-8 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-b-xl shadow-sm z-30">
                      {isBestBadge ? "Best Option" : "Cheapest Flight"}
                    </div>
                  )}

                  <div className="p-5 md:p-8">
                    {/* Same inner UI structure for individual flights */}
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
                      {/* Airline Brand & Info */}
                      <div className="flex items-center gap-5 w-full xl:w-auto">
                        <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl shrink-0">
                          <span className="text-sm font-bold text-slate-600 tracking-widest">{flight.flightNo.split('-')[0]}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">
                            {flight.airline}
                          </span>
                          <span className="text-sm text-slate-700 font-medium">{flight.flightNo} • {flight.aircraft}</span>
                        </div>
                      </div>

                      {/* Scheduling Architecture */}
                      <div className="flex flex-1 flex-col items-center w-full mt-4 xl:mt-0 xl:px-8">
                        <div className="flex w-full items-center justify-between gap-6">
                          <div className="text-center shrink-0 w-20">
                            <div className="text-3xl font-medium text-slate-900">{flight.dep.time}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{flight.dep.code}</div>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center relative min-w-[120px]">
                            <div className="w-full h-px bg-slate-300"></div>
                            {flight.stops === "Non-stop" ? (
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mt-2">
                                {flight.stops}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">
                                {flight.stops}
                              </span>
                            )}
                          </div>

                          <div className="text-center shrink-0 w-20">
                            <div className="text-3xl font-medium text-slate-900">{flight.arr.time}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{flight.arr.code}</div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing CTA */}
                      <div className="flex flex-col items-center xl:items-end gap-2 w-full xl:w-auto mt-6 xl:mt-0 pt-6 xl:pt-0 border-t border-slate-100 xl:border-none">
                        <div className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">{formatPrice(flight.price)}</div>
                        <button
                          className="w-full xl:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-tight hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98]"
                          onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                        >
                          {expandedFlight === flight.id ? "Minimize Features" : "View Amenities"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Custom Fares Matrix */}
                  {expandedFlight === flight.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {flight.fares.map((fare: any, idx: number) => (
                          <div key={idx} className={`bg-white p-6 rounded-2xl border-2 border-slate-100 transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between group cursor-pointer relative`}>
                            {idx === 1 && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-sm transition-all group-hover:bg-indigo-500 group-hover:text-white">
                                Smart Choice
                              </div>
                            )}
                            <div>
                              <h3 className="font-black text-slate-800 text-lg mb-6 group-hover:text-indigo-700 transition-colors">{fare.name}</h3>
                              <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                  <span className={`material-symbols-outlined text-[18px] text-slate-300 group-hover:text-indigo-400 transition-colors`}>check_circle</span>
                                  {idx === 0 ? "1 Cabin Bag (7kg)" : "Free Seat Selection"}
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                  <span className={`material-symbols-outlined text-[18px] text-slate-300 group-hover:text-indigo-400 transition-colors`}>{idx === 0 ? "cancel" : "check_circle"}</span>
                                  {idx === 0 ? "No Check-in Luggage" : idx === 1 ? "1 Checked Bag (15kg)" : "2 Checked Bags (30kg)"}
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                  <span className={`material-symbols-outlined text-[18px] text-slate-300 group-hover:text-indigo-400 transition-colors`}>{idx === 0 ? "cancel" : "check_circle"}</span>
                                  {idx === 0 ? "High Cancellation Fee" : "Change anytime with fee"}
                                </li>
                              </ul>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{formatPrice(fare.price)}</span>
                              <button
                                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.98] border-2 border-indigo-600 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md bg-white`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectFare(fare.name, fare.price, flight.airline, flight.dep.code, flight.arr.code);
                                }}
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Sticky Column: Fare Summary */}
        <div className="hidden lg:block w-3/12">
          <div className="sticky top-24 bg-white rounded-2xl border border-outline-variant/40 shadow-xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-5 flex gap-3 items-center">
              <span className="material-symbols-outlined text-white/80">receipt_long</span>
              <h2 className="text-white font-black text-lg">Fare Summary</h2>
            </div>
            <div className="p-6">
              {!selectedFare && !departureFlightFare ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
                    airplane_ticket
                  </span>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    Select a flight fare to view the breakdown and proceed to checkout.
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  {/* Summary for Departure Item */}
                  {departureFlightFare && (
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">flight_takeoff</span> Departure • {departureFlightFare.airline}
                          </div>
                          <div className="font-black text-lg tracking-tight text-slate-900 uppercase">{departureFlightFare.fromCode} <span className="text-slate-300 mx-1">→</span> {departureFlightFare.toCode}</div>
                        </div>
                        <div className="text-[10px] bg-slate-50 px-2 py-1 rounded-md text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                          {departureFlightFare.name}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-2 text-right">
                        {formatPrice(departureFlightFare.price)}
                      </div>
                    </div>
                  )}

                  {/* Summary for Return/Current Item */}
                  {selectedFare && (
                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            {tripType === 'round-trip' ? <><span className="material-symbols-outlined text-[12px]">flight_land</span> Return • {selectedFare.airline}</> : <><span className="material-symbols-outlined text-[12px]">flight_takeoff</span> {selectedFare.airline}</>}
                          </div>
                          <div className="font-black text-lg tracking-tight text-slate-900 uppercase">{selectedFare.fromCode} <span className="text-slate-300 mx-1">→</span> {selectedFare.toCode}</div>
                        </div>
                        <div className="text-[10px] bg-slate-50 px-2 py-1 rounded-md text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                          {selectedFare.name}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-2 text-right">
                        {formatPrice(selectedFare.price)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Base Fare</span>
                      <span className="font-bold text-slate-900">{formatPrice(combinedFareWithoutTaxes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Taxes & Surcharges</span>
                      <span className="font-bold text-slate-900">{formatPrice(totalTaxes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Service Fee</span>
                      <span className="font-black text-green-500 tracking-wider">FREE</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="font-black text-slate-900">Total Amount</span>
                      <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                        {formatPrice(currentTotalAmount)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 text-right uppercase tracking-wider">
                      Includes all taxes & fees
                    </p>
                  </div>

                  {/* Conditional Button based on Stage */}
                  {tripType === 'round-trip' && selectionStage === 'departure' ? (
                    <button
                      className="w-full bg-slate-300 text-slate-500 cursor-not-allowed py-4 rounded-xl font-black tracking-tight flex items-center justify-center gap-2"
                      disabled
                    >
                      Confirm Return Flight to Proceed
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={!selectedFare}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-black tracking-tight hover:bg-slate-800 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Confirm & Book <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Flights() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary">Loading Flights System...</div>}>
      <FlightsContent />
    </Suspense>
  );
}
