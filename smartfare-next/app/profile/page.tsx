"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication Validation
    const userStr = localStorage.getItem("smartfare_user");
    if (!userStr) {
      router.push("/");
      return;
    }
    
    try {
      const parsed = JSON.parse(userStr);
      if (!parsed || !parsed.name) throw new Error("Invalid User");
      setUser(parsed);
      
      // Async pull recent bookings securely linked strictly to User constraints if we had filtering,
      // For now, mapping array structure generally across JSON ledger hitting API natively
      fetch('/api/bookings')
        .then(res => res.json())
        .then(data => {
           if(Array.isArray(data)) {
              // Get the 2 most recent records parsing
              const history = data.reverse().slice(0, 2);
              setRecentActivity(history);
           }
           setLoading(false);
        })
        .catch(err => {
           console.error(err);
           setLoading(false);
        });
        
    } catch(e) {
      router.push("/");
    }
  }, [router]);

  if(loading || !user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-20">
         <div className="flex justify-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce delay-100"></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce delay-200"></div>
         </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Profile Card Main Block */}
        <div className="glass-card bg-white border border-outline-variant/30 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary to-indigo-500 z-0 opacity-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100 flex-shrink-0">
               <img 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM64ASeEkDlf9p_ZkoEIrgB49E82O8R7g0Q1gmbtaNClzisQB4D2XMmi-HKsr2-XBfyjkvhH5ASIQSJE-QstWw2SoeE5uF9PUwrN0yTY_UhJHFq6l_eQtSTJKBMv9Nkmn6syZ8BBtyq9LoguC2e_bxZcuWruGH9XQkockY8hupjY6LHHYSg7B5nrhzJVuESMkROb3jGrEPeTGamLYk5yYEnJj1686HJ-4IatT7IXv-40SUe3psD5sx3Anq117Fcv4N9p1wF8EL5bo" 
                 alt="User Avatar" 
                 className="w-full h-full object-cover"
               />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2 mt-2">
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-widest rounded-md border border-green-200">
                 Verified Member
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-dashed border-outline-variant/50 w-full">
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                     <p className="text-sm font-medium text-slate-800">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                     <p className="text-sm font-medium text-slate-800">{user.phone || "+91 ••• ••• ••••"}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</p>
                     <p className="text-sm font-medium text-slate-800">{user.age || "N/A"} years old</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div>
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-black text-slate-900">Recent Activity</h2>
             <Link href="/bookings" className="text-indigo-600 font-bold text-sm hover:underline">View All</Link>
           </div>
           
           {recentActivity.length === 0 ? (
             <div className="bg-white border focus:border-outline-variant/30 rounded-2xl p-8 text-center shadow-md">
                <p className="text-slate-500 font-medium">No recent bookings found.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between hover:shadow-lg transition-all duration-300 gap-4">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                       <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-primary flex-shrink-0">
                         <span className="material-symbols-outlined rounded">flight_takeoff</span>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.airline}</p>
                         <h3 className="text-lg font-black text-slate-900">{item.from} <span className="text-slate-300 mx-2">→</span> {item.to}</h3>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6 justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                       <div className="text-left md:text-right">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                         <p className="text-sm font-bold text-green-600">CONFIRMED</p>
                       </div>
                       <Link 
                         href={`/ticket?from=${item.from}&to=${item.to}&airline=${item.airline}&price=${item.price}&first=${item.passenger.split(' ')[0]}&last=${item.passenger.split(' ')[1] || ""}`} 
                         className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                       >
                         View Pass
                       </Link>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

      </div>
    </main>
  );
}
