"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { calculateTotalFare } from "@/lib/utils/fareCalculator";
import { useAuth } from "@/app/context/AuthContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const airline = searchParams?.get("airline") || "Air India";
  const flightId = searchParams?.get("flight") || "UNKNOWN";
  const rawBaseFare = parseInt(searchParams?.get("baseFare") || "0");
  const passengerCount = parseInt(searchParams?.get("passengers") || "1");
  const rawAddons = parseInt(searchParams?.get("addons") || "0");
  const isRoundTrip = searchParams?.get("trip") === "round-trip";
  // price param = exact grand total pre-computed by booking page (most reliable)
  const priceParam = parseInt(searchParams?.get("price") || "0");

  const { flightCost, totalTaxes, finalAddonsPrice, grandTotal } = calculateTotalFare({
     baseFare: rawBaseFare,
     passengerCount,
     addonsPrice: rawAddons,
     isRoundTrip
  });

  const fromCode = searchParams?.get("from") || "BOM";
  const toCode = searchParams?.get("to") || "VTZ";
  const firstName = searchParams?.get("first") || "";
  const lastName = searchParams?.get("last") || "";
  const passengerName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Passenger";

  // Multi-passenger names passed as JSON array from booking page
  let passengerNames: string[] = [];
  try {
    const raw = searchParams?.get("pNames");
    if (raw) passengerNames = JSON.parse(decodeURIComponent(raw));
  } catch {}
  if (passengerNames.length === 0) passengerNames = [passengerName];

  const taxes = totalTaxes;
  // Use pre-computed price from booking page if available, else fall back to fareCalculator
  const initialPrice = priceParam > 0 ? priceParam : grandTotal;
  const baseFare = flightCost;

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "HDFC1000") {
      setDiscount(1000);
      setPromoMsg("₹1000 discount applied!");
    } else if (code === "AXIS200") {
      setDiscount(200);
      setPromoMsg("₹200 cashback applied!");
    } else {
      setDiscount(0);
      setPromoMsg("Invalid promo code.");
    }
  };

  const finalTotal = Math.max(initialPrice - discount, 0);

  const passengers = parseInt(searchParams?.get("passengers") || "1");
  const seatsParam = searchParams?.get("seats") || "";
  const seats = seatsParam ? seatsParam.split(",") : [];
  let addons: any[] = [];
  try {
    addons = JSON.parse(decodeURIComponent(searchParams?.get("addonsArray") || "[]"));
  } catch (e) {}

  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const fareType = searchParams?.get("fareType") || "Saver";
  const contactEmail = searchParams?.get("contactEmail") || user?.email || "guest@example.com";

  // Create PaymentIntent once method is chosen
  useEffect(() => {
    if (!selectedMethod || finalTotal <= 0 || selectedMethod === "net") return;
    if (clientSecret) return; // already fetched
    setClientSecret(null);
    setStripeError(null);
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalTotal * 100,
        userId: user?.uid || null,
        email: contactEmail,
        airline,
        from: fromCode,
        to: toCode,
        passengerName: passengerNames[0],
        passengers: passengerNames.map((name) => ({ name })),
        seats,
        addons,
        fareType,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setBookingId(data.bookingId || null);
          setPnr(data.pnr || null);
        } else {
          setStripeError(data.error || "Failed to initialize payment.");
        }
      })
      .catch(() => setStripeError("Network error creating payment."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod, finalTotal]);

  return (
    <>
      <main suppressHydrationWarning={true} className="max-w-7xl mx-auto px-4 py-8 mt-20 lg:flex lg:gap-8 items-start">
        {/* Left Column: Checkout Journey */}
        <div className="flex-1 space-y-6">
          {/* Secure Header & Timer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-on-surface">Secure Checkout</h1>
                <p className="text-sm text-on-surface-variant flex items-center gap-1">
                  Your payment data is encrypted and 100% secure.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-fixed-dim/20 text-primary border border-primary/20 rounded-full">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-bold text-sm">
                Session expires in: <span className="ml-1 tracking-wider">09:52</span>
              </span>
            </div>
          </div>

          {/* Payment Selection Tiles */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "card", label: "Card",        icon: "credit_card",          sub: null },
                { id: "upi",  label: "UPI",         icon: "account_balance_wallet", sub: "Instant Settlement" },
                { id: "net",  label: "Net Banking", icon: "account_balance",       sub: "All major banks" },
              ].map(({ id, label, icon, sub }) => {
                const isActive = selectedMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedMethod(id)}
                    className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 w-full
                      ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-outline-variant bg-white hover:border-primary/60 hover:bg-primary/5"
                      }`}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px]">check</span>
                      </span>
                    )}
                    <span className={`material-symbols-outlined mb-2 text-3xl transition-colors ${
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                    }`}>
                      {icon}
                    </span>
                    <span className={`font-bold transition-colors ${isActive ? "text-primary" : "text-on-surface"}`}>
                      {label}
                    </span>
                    {sub && <span className="mt-2 text-xs text-on-surface-variant">{sub}</span>}
                    {id === "card" && (
                      <div className="mt-3 flex gap-2">
                        <img alt="Visa" className="h-4 opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa3JvZtnF0N7wWmsjhJrYHyP28N2OAYlS3UkjDF6AvdnDr3nLnTvK3zzfkrQ_BA0JZ9xdsBLg5PGMjdPtDj9_Uu-UcukuzK47jJRZqQ4FfgqhIK6x3RYzSI0YcYvFKeBNPi-p-y3WmDo6pYVAQ5OgN95wH9UYkQPCAdfyxtjFPViN03keh2R2VQAoZHdVRIVj5--rl00cNtFIK8O3lYvvv7cSD1jnsXj9zXlJTWxLFtOMhfx2wgpG1I_5OYUXCtOv5hzI-oQinVzY" />
                        <img alt="Mastercard" className="h-4 opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEd6hihGGvuVB8qDuLPP1rSoENDYZhNOFt9bDy1qm31QSKDAqSkepajEliC3PkrgFHRnAxZMZa3Ycub6X-x_p2lvUsfxS0DvFFPs_SrJZMzIAazNqtp2jbvV7ex6CTy-tafbiPfFY9EUcSI7tKYotqVg6WX8KOzbTlla_aKf9r6j7DDauBo1SoMRJjtctiADGGN0iXwRh77TIFiUwkSetUJGHlaLKGKlre0sagR1uGjQjpeQzPcWzltOJ3Zrg0LpZlmkuENl_7rvA" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Payment Section based on Method */}
          {selectedMethod === "net" ? (
             <div className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-on-surface mb-4">Select Your Bank</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                   {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                      <label key={bank} className="border border-outline-variant rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-primary transition-all">
                         <input type="radio" name="bank" className="accent-primary" defaultChecked={bank === 'SBI'} />
                         <span className="font-bold text-on-surface">{bank}</span>
                      </label>
                   ))}
                </div>
                <button 
                  onClick={async () => {
                     // Mock NetBanking flow bypasses Stripe completely
                     try {
                        const res = await fetch("/api/checkout/mock-net", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            amount: finalTotal * 100,
                            userId: user?.uid || null,
                            email: contactEmail,
                            airline,
                            from: fromCode,
                            to: toCode,
                            passengerName: passengerNames[0],
                            passengers: passengerNames.map((name) => ({ name })),
                            seats,
                            addons,
                            fareType,
                            bankName: "MOCK_BANK"
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.pnr) {
                           router.push(`/ticket?pnr=${data.pnr}`);
                        } else {
                           setStripeError("Bank simulation failed.");
                        }
                     } catch(e) {
                        setStripeError("Network error during bank simulation.");
                     }
                  }}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1"
                >
                   Proceed to Bank
                </button>
             </div>
          ) : selectedMethod ? (
            <div className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm space-y-6">
              {stripeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {stripeError}
                </div>
              )}

              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: { colorPrimary: "#4f46e5", borderRadius: "10px" },
                    },
                  }}
                >
                  <StripePaymentForm
                    finalTotal={finalTotal}
                    fromCode={fromCode}
                    toCode={toCode}
                    airline={airline}
                    passengerName={passengerName}
                    bookingId={bookingId}
                    pnrFromCheckout={pnr}
                    promoCode={promoCode}
                    promoMsg={promoMsg}
                    discount={discount}
                    onApplyPromo={handleApplyPromo}
                    onPromoChange={(v: string) => setPromoCode(v)}
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-on-surface-variant font-medium">Initializing secure payment...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300">credit_card</span>
              <p className="text-sm font-semibold text-slate-400">Select a payment method above to continue</p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="w-full lg:w-96 mt-8 lg:mt-0 space-y-6">
          {/* Price & Summary Sidebar */}
          <div className="sticky top-24 bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-5 bg-surface-container">
              <h3 className="font-bold text-on-surface">Flight Summary</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">{fromCode}</div>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <span className="text-[10px] text-on-surface-variant font-medium mb-1">
                    Non-stop
                  </span>
                  <div className="w-full h-[2px] bg-outline-variant relative">
                    <span
                      className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary rotate-90 text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      flight
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">{toCode}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface border border-outline-variant/30 rounded-lg">
                <div className="h-10 w-10 bg-white border border-outline-variant rounded-md flex items-center justify-center overflow-hidden font-bold italic text-primary">
                  {airline.substring(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-on-surface">{airline}</div>
                  <div className="text-xs text-on-surface-variant">Economy</div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-outline-variant">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Base Fare (1 Adult)</span>
                  <span className="font-medium text-on-surface">{formatPrice(baseFare)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Taxes & Fees</span>
                  <span className="font-medium text-on-surface">{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Promo Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>

                <div className="pt-4 flex justify-between items-end border-t border-dashed border-outline-variant">
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Total Amount</div>
                    <div className="text-xs text-primary font-medium">Inclusive of all taxes</div>
                  </div>
                  <div className="text-3xl font-black text-on-surface">{formatPrice(finalTotal)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600 text-sm">verified_user</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                PCI-DSS Compliant Transaction
              </span>
            </div>
          </div>
        </aside>
      </main>

    </>
  );
}

// ── Stripe inner form (must be child of <Elements>) ──────────────────────────
function StripePaymentForm({
  finalTotal, fromCode, toCode, airline,
  passengerName, bookingId, pnrFromCheckout,
  promoCode, promoMsg, discount,
  onApplyPromo, onPromoChange,
}: any) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setPayError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setPayError(error.message || "Payment failed.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Confirm with backend — send both paymentIntentId AND bookingId for direct doc update
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          bookingId,  // direct doc ID — no Firestore query needed
        }),
      });
      const data = await res.json();
      const finalPnr = data.pnr || pnrFromCheckout || "";
      // Build ticket URL using the real passenger name
      const [first, ...rest] = passengerName.split(" ");
      const last = rest.join(" ");
      router.push(
        `/ticket?from=${fromCode}&to=${toCode}&airline=${encodeURIComponent(airline)}&price=${finalTotal}&first=${encodeURIComponent(first)}&last=${encodeURIComponent(last)}${finalPnr ? `&pnr=${finalPnr}` : ""}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Promo Code */}
      <div>
        <label className="block text-sm font-bold text-on-surface mb-3">Add Promo Code</label>
        <div className="relative max-w-md">
          <input
            className="w-full pl-10 pr-24 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface"
            placeholder="HDFC1000 or AXIS200"
            type="text"
            value={promoCode}
            onChange={(e) => onPromoChange(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant">sell</span>
          <button
            type="button"
            onClick={onApplyPromo}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-5 py-2 bg-on-background text-white text-xs font-bold rounded-md hover:bg-slate-700 transition-colors uppercase tracking-widest"
          >
            Apply
          </button>
        </div>
        {promoMsg && (
          <p className={`text-xs mt-2 font-bold ${discount > 0 ? "text-green-600" : "text-red-500"}`}>{promoMsg}</p>
        )}
      </div>

      {/* Stripe Payment Element */}
      <div>
        <label className="block text-xs font-bold text-primary mb-3 uppercase tracking-wider">Card Details</label>
        <PaymentElement />
      </div>

      {payError && (
        <p className="text-sm text-red-600 font-medium">{payError}</p>
      )}

      <p className="text-xs text-slate-400 text-center">
        Test card: <span className="font-mono font-bold">4242 4242 4242 4242</span> · any future date · any CVC
      </p>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-5 bg-primary text-white rounded-xl font-black text-lg tracking-widest shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
      >
        {isProcessing ? "PROCESSING..." : `PAY ${formatPrice(finalTotal)}`}
        {!isProcessing && (
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        )}
      </button>
    </form>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary">Securing Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
