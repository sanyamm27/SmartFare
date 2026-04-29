import Link from "next/link";
import Header from "@/app/components/Header";

export default function BaggagePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <span className="material-symbols-outlined text-3xl">luggage</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Baggage Policy</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            All SmartFare bookings include a standard cabin baggage allowance of 7kg. 
            Checked baggage allowances vary by fare type (Saver, Flex, Premium). 
            Additional weight can be purchased during the Add-ons step.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Cabin Bag</span>
              <span className="font-bold text-indigo-600">7 KG</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Checked Bag (Basic)</span>
              <span className="font-bold text-indigo-600">15 KG</span>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
