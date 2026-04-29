"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SeatMap from "@/app/components/SeatMap";
import Header from "@/app/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { calculateTotalFare } from '@/lib/utils/fareCalculator';

const MEALS = [
  { id: "m1", name: "Roasted Chicken Sandwich", price: 350, desc: "Freshly made sandwich with roasted chicken and herbs.", img: "lunch_dining" },
  { id: "m2", name: "Veg Biryani", price: 300, desc: "Aromatic basmati rice cooked with mixed vegetables.", img: "restaurant" },
  { id: "m3", name: "Chocolate Muffin & Coffee", price: 250, desc: "Hot brew served with a soft chocolate chip muffin.", img: "local_cafe" },
  { id: "m4", name: "Mediterranean Salad", price: 400, desc: "Crisp greens with olives, feta, and vinaigrette.", img: "eco" },
  { id: "m5", name: "Japanese Sushi Box", price: 650, desc: "Assorted fresh sushi rolls with soy and wasabi.", img: "set_meal" },
  { id: "m6", name: "Quinoa & Avocado Bowl", price: 450, desc: "Healthy bowl packed with protein and fresh avocado.", img: "rice_bowl" },
  { id: "m7", name: "Roasted Nut Mix", price: 150, desc: "Premium assorted nuts roasted with sea salt.", img: "tapas" },
  { id: "m8", name: "Artisanal Dessert Trio", price: 500, desc: "Three miniature gourmet desserts to satisfy your sweet tooth.", img: "cake" },
  { id: "m9", name: "Classic Cheeseburger", price: 450, desc: "Juicy beef patty with sharp cheddar and fresh lettuce.", img: "lunch_dining" },
  { id: "m10", name: "Paneer Tikka Wrap", price: 300, desc: "Spiced paneer wrapped in a warm, freshly baked flatbread.", img: "bakery_dining" },
  { id: "m11", name: "Gourmet Cheese Platter", price: 600, desc: "Selection of aged cheeses served with artisan crackers.", img: "tapas" },
  { id: "m12", name: "Fresh Fruit Bowl", price: 200, desc: "Seasonal sliced fresh fruits.", img: "nutrition" },
  { id: "m13", name: "Spicy Ramen Cup", price: 250, desc: "Instant hot and spicy noodles, perfect for comfort.", img: "ramen_dining" }
];

const PREMIUM = [
  { id: "p1", name: "Airport Lounge Access", price: 1200, desc: "Relax in comfort with priority services before your flight.", icon: "airline_seat_flat" },
  { id: "p2", name: "Fast Track Security", price: 450, desc: "Skip the long queues at security checkpoints.", icon: "speed" },
  { id: "p3", name: "Excess Baggage Insurance", price: 299, desc: "Coverage for your high-value checked items against loss.", icon: "health_and_safety" }
];

const BAGGAGE = [
  { id: "b1", name: "Extra Cabin Bag (5kg)", price: 800, desc: "Bring an extra bag onboard.", icon: "work" },
  { id: "b2", name: "Checked Baggage (10kg)", price: 1500, desc: "Add extra weight to your check-in baggage allowance.", icon: "luggage" }
];

export default function ServicesPage({ params }: { params: Promise<{ flightId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = use(params);
  const flightId = unwrappedParams.flightId as string;
  const decodedFlightId = flightId as string;

  const passengers = parseInt(searchParams?.get("passengers") || "1");
  const isRoundTrip = searchParams?.get("trip") === "round-trip";
  const airlineParam = searchParams?.get("airline") || "Air India";
  const fromParam = searchParams?.get("from") || "BOM";
  const toParam = searchParams?.get("to") || "VTZ";
  const tripParam = searchParams?.get("trip") || "one-way";
  const fareTypeParam = searchParams?.get("fareType") || "Saver";

  const [activeTab, setActiveTab] = useState<"seats" | "meals" | "baggage" | "premium">("seats");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [seatLimitWarning, setSeatLimitWarning] = useState(false);

  const rawBaseFare = parseInt(searchParams?.get("baseFare") || "5400");
  const rawAddonsPrice = selectedAddons.reduce((sum, item) => sum + item.price, 0);

  // Live Total: Base Fare is exact amenity price, just add addons (no hidden taxes/multipliers)
  const totalFare = rawBaseFare + rawAddonsPrice;

  const handleSeatSelect = (seat: string, price: number) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
      setSelectedAddons(prev => prev.filter(a => a.id !== `seat-${seat}`));
    } else {
      if (selectedSeats.length >= passengers) {
         setSeatLimitWarning(true);
         setTimeout(() => setSeatLimitWarning(false), 2000);
         return;
      }
      setSelectedSeats(prev => [...prev, seat]);
      setSelectedAddons(prev => [...prev, { id: `seat-${seat}`, name: `Seat ${seat}`, price, type: "seat" }]);
    }
  };

  const toggleAddon = (item: any, type: string) => {
    const existing = selectedAddons.find(a => a.id === item.id);
    if (existing) {
      setSelectedAddons(prev => prev.filter(a => a.id !== item.id));
    } else {
      setSelectedAddons(prev => [...prev, { ...item, type }]);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface pb-32">
        {/* Dynamic Header */}
        <div className="bg-slate-900 pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-2">
                <span className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase">{decodedFlightId}</span>
                <span className="text-slate-400 text-sm font-medium">Saturday, 24 Oct</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Mumbai (BOM) to Visakhapatnam (VTZ)</h1>
              <div className="flex items-center text-indigo-200 mt-4 w-[280px] justify-between">
                <div className="flex flex-col items-center w-20">
                  <span className="text-2xl font-black text-white">15:40</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Departure</span>
                </div>
                <div className="flex-1 flex flex-col items-center relative min-w-[80px]">
                  <div className="w-full h-[1.5px] bg-slate-600"></div>
                </div>
                <div className="flex flex-col items-center w-20">
                  <span className="text-2xl font-black text-white">18:29</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Arrival</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20 text-right">
               <span className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-1 block">Add-ons Total</span>
               <span className="text-3xl font-medium">₹{rawAddonsPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
          {/* Tab System Wrapper */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-4 items-center justify-start xl:justify-center">
              {["seats", "meals", "baggage", "premium"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2
                    ${activeTab === tab 
                      ? "bg-primary text-white border-primary shadow-[0_10px_30px_rgba(79,70,229,0.3)] scale-105" 
                      : "bg-white text-slate-500 border-slate-100 hover:border-primary/50 hover:bg-slate-50"}`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                     {tab === 'seats' ? 'airline_seat_recline_normal' : tab === 'meals' ? 'restaurant' : tab === 'baggage' ? 'luggage' : 'star'}
                  </span>
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
          </div>

          {/* Content Area */}
          <div className="mt-8">
             {activeTab === "seats" && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                 <div className={`mb-6 py-2 px-6 rounded-full font-bold text-sm tracking-wide transition-all border ${seatLimitWarning ? 'bg-red-50 border-red-200 text-red-600 animate-pulse scale-105 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                   {seatLimitWarning ? "Seat limit reached!" : selectedSeats.length === passengers 
                      ? <span className="text-green-600">All seats selected ✓</span> 
                      : selectedSeats.length === 0 
                         ? `Select ${passengers} Seat${passengers > 1 ? 's' : ''}` 
                         : `${selectedSeats.length} of ${passengers} selected`}
                 </div>
                 <SeatMap selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
               </div>
             )}

             {activeTab === "meals" && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {MEALS.map(meal => (
                   <div key={meal.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group" onClick={() => toggleAddon(meal, 'meal')}>
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">{meal.img}</span>
                      </div>
                      <h3 className="font-black text-xl text-on-surface mb-2 pointer-events-none">{meal.name}</h3>
                      <p className="text-on-surface-variant text-sm font-medium mb-6 pointer-events-none">{meal.desc}</p>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-6">
                        <span className="font-medium text-lg pointer-events-none">₹{meal.price}</span>
                        <button className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide ${selectedAddons.some(a => a.id === meal.id) ? 'bg-primary text-white shadow-md' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}>
                           {selectedAddons.some(a => a.id === meal.id) ? 'Added' : 'Add to trip'}
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}

             {activeTab === "baggage" && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {BAGGAGE.map(bag => (
                   <div key={bag.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group" onClick={() => toggleAddon(bag, 'baggage')}>
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">{bag.icon}</span>
                      </div>
                      <h3 className="font-black text-xl text-on-surface mb-2 pointer-events-none">{bag.name}</h3>
                      <p className="text-on-surface-variant text-sm font-medium mb-6 pointer-events-none">{bag.desc}</p>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-6">
                        <span className="font-medium text-lg pointer-events-none">₹{bag.price}</span>
                        <button className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide ${selectedAddons.some(a => a.id === bag.id) ? 'bg-primary text-white shadow-md' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}>
                           {selectedAddons.some(a => a.id === bag.id) ? 'Added' : 'Add to trip'}
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}

             {activeTab === "premium" && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {PREMIUM.map(item => (
                   <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group" onClick={() => toggleAddon(item, 'premium')}>
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                      </div>
                      <h3 className="font-black text-xl text-on-surface mb-2 pointer-events-none">{item.name}</h3>
                      <p className="text-on-surface-variant text-sm font-medium mb-6 pointer-events-none">{item.desc}</p>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-6">
                        <span className="font-medium text-lg pointer-events-none">₹{item.price}</span>
                        <button className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide ${selectedAddons.some(a => a.id === item.id) ? 'bg-primary text-white shadow-md' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}>
                           {selectedAddons.some(a => a.id === item.id) ? 'Added' : 'Add to trip'}
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Sticky Footer Tracker */}
        <div className="fixed bottom-0 left-0 w-full z-[100] bg-white/95 backdrop-blur-md border-t border-surface-container-highest shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="bg-surface-container w-14 h-14 rounded-2xl flex items-center justify-center text-primary shrink-0">
                 <span className="material-symbols-outlined text-2xl">receipt_long</span>
               </div>
               <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</div>
                 <div className="flex items-center overflow-hidden h-10 w-40">
                   <AnimatePresence mode="popLayout">
                     <motion.div
                       key={totalFare}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -20, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       className="text-3xl font-medium text-slate-900"
                     >
                       ₹{totalFare.toLocaleString('en-IN')}
                     </motion.div>
                   </AnimatePresence>
                 </div>
               </div>
             </div>
             
             <button 
               disabled={selectedSeats.length !== passengers}
               onClick={() => router.push(
                 `/booking?flight=${decodedFlightId}` +
                 `&baseFare=${rawBaseFare}` +
                 `&addons=${rawAddonsPrice}` +
                 `&trip=${tripParam}` +
                 `&from=${fromParam}` +
                 `&to=${toParam}` +
                 `&airline=${encodeURIComponent(airlineParam)}` +
                 `&passengers=${passengers}` +
                 `&seats=${encodeURIComponent(selectedSeats.join(','))}` +
                 `&addonsArray=${encodeURIComponent(JSON.stringify(selectedAddons))}` +
                 `&fareType=${encodeURIComponent(fareTypeParam)}`
               )}
               className={`w-full md:w-auto text-white px-12 py-4 rounded-2xl font-bold tracking-wide transition-all flex items-center justify-center gap-3 ${selectedSeats.length !== passengers ? 'bg-slate-300 opacity-50 pointer-events-none' : 'bg-primary shadow-xl shadow-primary/30 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/40 active:scale-95'}`}
             >
               Passenger Details →
               <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
             </button>
          </div>
        </div>
      </main>
    </>
  );
}
