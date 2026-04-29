"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

export const dynamic = "force-dynamic";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === "CONFIRMED" ? { dot: "bg-green-500",  cls: "bg-green-50 text-green-700 border-green-200" }
    : status === "CANCELLED" ? { dot: "bg-red-400",  cls: "bg-red-50 text-red-700 border-red-200" }
    : { dot: "bg-amber-400", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Cancel confirmation modal ─────────────────────────────────────────────────
function CancelModal({
  booking, onClose, onCancelled,
}: { booking: any; onClose: () => void; onCancelled: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ refundAmount: number; refundLabel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // fareType is read automatically from the Firestore doc server-side
        body: JSON.stringify({ bookingId: booking.docId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");
      setResult({ refundAmount: data.refundAmount, refundLabel: data.refundLabel });
      onCancelled(booking.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {result ? (
          /* Success */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Booking Cancelled</h2>
            <p className="text-sm text-slate-500 mb-4">
              PNR <span className="font-mono font-bold text-indigo-600">{booking.id}</span> has been cancelled.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Refund Amount</p>
              <p className="text-2xl font-black text-slate-900">{formatPrice(result.refundAmount)}</p>
              <p className="text-xs text-slate-500 mt-1">{result.refundLabel}</p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Close</button>
          </div>
        ) : (
          /* Confirm */
          <>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500">cancel</span>
                </div>
                <h2 className="text-lg font-black text-slate-900">Cancel Booking</h2>
              </div>
              <p className="text-sm text-slate-500 ml-12">
                PNR <span className="font-mono font-bold text-indigo-600">{booking.id}</span>
                {" · "}{booking.from} → {booking.to} · {booking.passenger}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-800 mb-1">⚠ Are you sure?</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Your refund will be calculated automatically based on your fare type and credited
                  to your original payment method within 5–7 business days.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Keep Booking
              </button>
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60">
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, index, onCancelClick }: { booking: any; index: number; onCancelClick: (b: any) => void }) {
  const accent =
    booking.status === "CONFIRMED" ? "bg-green-500"
    : booking.status === "CANCELLED" ? "bg-red-400"
    : "bg-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <div className={`h-1 w-full ${accent}`} />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-2xl">flight</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{booking.airline}</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                {booking.from} <span className="text-slate-300 font-light mx-1">→</span> {booking.to}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Passenger</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{booking.passenger}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">PNR</p>
            <p className="text-sm font-black text-indigo-600 tracking-widest font-mono">{booking.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amount</p>
            <p className="text-sm font-black text-slate-900">{formatPrice(booking.price)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium flex-1 min-w-0 truncate">
            Ask SkyGuide: type PNR <span className="font-mono font-bold text-indigo-500">{booking.id}</span>
          </p>
          {booking.status === "CONFIRMED" && (
            <button onClick={() => onCancelClick(booking)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 active:scale-95 transition-all whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">cancel</span>
              Cancel
            </button>
          )}
          {booking.status === "CANCELLED" && (
            <span className="text-xs text-slate-400 font-medium italic">Refund processed</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const url = user ? `/api/bookings?userId=${encodeURIComponent(user.uid)}` : "/api/bookings";
    console.log("[My Bookings] Fetching:", url);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        console.log("[My Bookings] Response:", data);
        if (Array.isArray(data)) {
          const mapped = data.map((b: any) => ({
            docId: b.id,                          // Firestore doc ID (for cancel)
            id: b.pnr || b.id,                   // PNR shown to user
            airline: b.flightDetails?.flightCode || b.airline || "AI-000",
            from: b.flightDetails?.origin || b.from || "BOM",
            to: b.flightDetails?.destination || b.to || "VTZ",
            passenger: b.passengers?.[0]?.name || b.passenger || "Unknown Passenger",
            price: b.totalAmount || b.price || 0,
            status: b.status || "CONFIRMED",
          }));
          const order: Record<string, number> = { CONFIRMED: 0, PENDING: 1, CANCELLED: 2 };
          mapped.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
          setBookings(mapped);
        }
        setLoading(false);
      })
      .catch((err) => { console.error("[My Bookings] Error:", err); setLoading(false); });
  }, [user, authLoading]);

  const handleCancelled = (pnr: string) => {
    setBookings((prev) => prev.map((b) => (b.id === pnr ? { ...b, status: "CANCELLED" } : b)));
  };

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const pending   = bookings.filter((b) => b.status === "PENDING");
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");

  const Section = ({ title, dot, items, startIdx }: { title: string; dot: string; items: any[]; startIdx: number }) =>
    items.length > 0 ? (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">{title} ({items.length})</h2>
        </div>
        <div className="space-y-4">
          {items.map((b, i) => <BookingCard key={b.docId || b.id} booking={b} index={startIdx + i} onCancelClick={setCancelTarget} />)}
        </div>
      </section>
    ) : null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">My Bookings</h1>
        <p className="text-slate-500 text-sm font-medium">
          {user ? `Trips for ${user.email}` : "Showing all bookings"}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your trips...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">airplane_ticket</span>
          <h2 className="text-xl font-black text-slate-800 mb-2">No bookings found</h2>
          <p className="text-slate-500 text-sm font-medium mb-3">Your confirmed flights will appear here after checkout.</p>
          {user ? (
            <p className="text-xs text-slate-400 font-mono bg-slate-50 inline-block px-3 py-1 rounded-full">
              Filtering uid: {user.uid.slice(0, 12)}…
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-medium">⚠ Sign in to see your personal bookings</p>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <Section title="Confirmed" dot="bg-green-500" items={confirmed} startIdx={0} />
          <Section title="Pending"   dot="bg-amber-400" items={pending}   startIdx={confirmed.length} />
          <Section title="Cancelled" dot="bg-red-400"   items={cancelled} startIdx={confirmed.length + pending.length} />
        </div>
      )}

      {bookings.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-10 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
          </div>
          <div>
            <p className="text-sm font-black text-indigo-900 mb-0.5">Ask SkyGuide about your trip or refund policy</p>
            <p className="text-xs text-indigo-600 font-medium">
              Click the chat bubble and type your PNR — <span className="font-mono font-bold">{confirmed[0]?.id || bookings[0]?.id}</span>
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onCancelled={(pnr) => { handleCancelled(pnr); setCancelTarget(null); }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
