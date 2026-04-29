import Link from "next/link";
import Header from "@/app/components/Header";

export default function RefundsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <span className="material-symbols-outlined text-3xl">currency_exchange</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Cancellation & Refunds</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Our cancellation policy is dynamic and depends entirely on the fare class selected during booking.
            Refunds are typically processed to the original payment method within 5-7 business days.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
              <span className="font-semibold text-slate-700">Saver Fares</span>
              <span className="font-bold text-red-600">Non-refundable</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <span className="font-semibold text-slate-700">Flex Fares</span>
              <span className="font-bold text-yellow-600">50% Refund</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
              <span className="font-semibold text-slate-700">Premium Fares</span>
              <span className="font-bold text-green-600">90% Refund</span>
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
