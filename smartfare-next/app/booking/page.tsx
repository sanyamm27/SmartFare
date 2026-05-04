"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

type Passenger = { title: string; firstName: string; lastName: string; phone: string };

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const flight      = searchParams?.get("flight") || "AI-834";
  const basePrice   = parseInt(searchParams?.get("baseFare") || "5400");
  const addonsPrice = parseInt(searchParams?.get("addons") || "0");
  const passengerCount = parseInt(searchParams?.get("passengers") || "1");
  // Live Total: Base Price already is the exact amenity total, no passenger multiplication needed
  const grandTotal  = basePrice + addonsPrice;
  const fromCode    = searchParams?.get("from") || "BOM";
  const toCode      = searchParams?.get("to") || "VTZ";
  const airlineParam = searchParams?.get("airline") || "Air India";
  const fareTypeParam = searchParams?.get("fareType") || "Saver";
  const dateParam   = searchParams?.get("date") || "Saturday, 24 Oct";
  const seats       = searchParams?.get("seats") || "";
  const addonsArray = searchParams?.get("addonsArray") || "[]";

  // One form state per passenger
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: passengerCount }, () => ({ title: "Mr", firstName: "", lastName: "", phone: "" }))
  );
  const [contactEmail, setContactEmail] = useState("");

  const updatePassenger = (idx: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // Build pNames as JSON array of full names for checkout
    const names = passengers.map((p) => `${p.title} ${p.firstName} ${p.lastName}`.trim());
    const pNamesParam = encodeURIComponent(JSON.stringify(names));
    // Keep first=/ last= for backwards compat with ticket page
    const first = passengers[0]?.firstName || "";
    const last  = passengers[0]?.lastName  || "";
    router.push(
      `/checkout?price=${grandTotal}&flight=${flight}&from=${fromCode}&to=${toCode}` +
      `&airline=${encodeURIComponent(airlineParam)}` +
      `&first=${encodeURIComponent(first)}&last=${encodeURIComponent(last)}` +
      `&passengers=${passengerCount}&seats=${seats}&addonsArray=${addonsArray}` +
      `&pNames=${pNamesParam}&fareType=${encodeURIComponent(fareTypeParam)}` +
      `&contactEmail=${encodeURIComponent(contactEmail)}` +
      `&date=${encodeURIComponent(dateParam)}`
    );
  };

  const inputCls = "peer w-full px-4 py-3.5 border border-outline rounded-lg bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-transparent";
  const labelCls = "absolute left-4 top-3.5 text-outline pointer-events-none transition-all duration-200 origin-left peer-focus:scale-85 peer-focus:-translate-y-5 peer-[&:not(:placeholder-shown)]:scale-85 peer-[&:not(:placeholder-shown)]:-translate-y-5 bg-white px-1 text-sm";

  return (
    <>
      <main className="pt-8 mt-20 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Forms */}
        <form onSubmit={handleContinue} className="lg:col-span-8 space-y-8">
          <section>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-background mb-2">Passenger Details</h1>
            <p className="text-on-surface-variant">Please ensure names match the identification documents used for travel.</p>
          </section>

          {/* One card per passenger */}
          {passengers.map((pax, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <h2 className="text-lg font-bold text-on-surface">
                  Passenger {idx + 1} {passengerCount > 1 ? `of ${passengerCount}` : ""}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-on-surface mb-3">Title</label>
                  <div className="flex gap-3">
                    {["Mr", "Ms", "Mrs", "Dr"].map((t) => (
                      <label key={t} className="cursor-pointer">
                        <input
                          className="hidden peer"
                          type="radio"
                          name={`title-${idx}`}
                          value={t}
                          checked={pax.title === t}
                          onChange={() => updatePassenger(idx, "title", t)}
                        />
                        <div className="px-4 py-2 rounded-lg border border-outline hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container transition-all text-sm font-medium">
                          {t}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* First Name */}
                <div className="relative floating-label-group">
                  <input
                    className={inputCls}
                    id={`first-${idx}`}
                    placeholder="First Name"
                    type="text"
                    required
                    value={pax.firstName}
                    onChange={(e) => updatePassenger(idx, "firstName", e.target.value)}
                  />
                  <label className={labelCls} htmlFor={`first-${idx}`}>First Name</label>
                </div>

                {/* Last Name */}
                <div className="relative floating-label-group">
                  <input
                    className={inputCls}
                    id={`last-${idx}`}
                    placeholder="Last Name"
                    type="text"
                    required
                    value={pax.lastName}
                    onChange={(e) => updatePassenger(idx, "lastName", e.target.value)}
                  />
                  <label className={labelCls} htmlFor={`last-${idx}`}>Last Name</label>
                </div>

                {/* Phone */}
                <div className={`relative floating-label-group ${idx === 0 ? "md:col-span-1" : "md:col-span-2"}`}>
                  <input
                    className={inputCls}
                    id={`phone-${idx}`}
                    placeholder="Phone Number"
                    type="tel"
                    pattern="[6-9][0-9]{9}"
                    required={idx === 0}
                    value={pax.phone}
                    onChange={(e) => updatePassenger(idx, "phone", e.target.value)}
                  />
                  <label className={labelCls} htmlFor={`phone-${idx}`}>Phone Number</label>
                </div>

                {/* Contact Email (Only for Primary Passenger) */}
                {idx === 0 && (
                  <div className="relative floating-label-group md:col-span-1">
                    <input
                      className={inputCls}
                      id="contact-email"
                      placeholder="Contact Email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <label className={labelCls} htmlFor="contact-email">Contact Email</label>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Special Assistance */}
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">accessible</span>
                <h2 className="text-lg font-bold text-on-surface">Special Assistance</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-all" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "wheelchair_pickup", label: "Wheelchair Assistance", sub: "Ramp and cabin access help" },
                { icon: "visibility_off",   label: "Visual/Hearing Aid",    sub: "Guided navigation support" },
              ].map((item) => (
                <button key={item.label} type="button"
                  className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-container transition-all text-left">
                  <div className="bg-surface-container-high p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              Continue to Payment
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-4 px-12">
              By continuing you agree to our{" "}
              <Link className="text-primary underline" href="/">Terms of Service</Link> and{" "}
              <Link className="text-primary underline" href="/">Privacy Policy</Link>.
            </p>
          </div>
        </form>

        {/* Right: Flight Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden">
              <div className="bg-surface-container px-6 py-4 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                <h3 className="font-bold text-on-background">Flight Summary</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-on-background">{fromCode}</p>
                  <span className="material-symbols-outlined text-primary transform rotate-90">flight</span>
                  <p className="text-2xl font-black text-on-background">{toCode}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
                    <span className="font-medium">{dateParam}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="font-bold">15:40</span>
                    <div className="h-px flex-1 bg-slate-300 mx-3" />
                    <span className="font-bold">18:29</span>
                  </div>
                </div>
                <hr className="border-outline-variant/30" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Base Fare (Live Total)</span>
                    <span className="font-bold">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Add-ons</span>
                    <span className="font-bold">{formatPrice(addonsPrice)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-dashed border-outline-variant/60">
                    <span className="text-xl font-bold text-on-background">
                      Grand Total
                      <span className="text-sm font-medium text-slate-500 block">({passengerCount} Passenger{passengerCount > 1 ? "s" : ""})</span>
                    </span>
                    <span className="text-xl font-black text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-background">Secure Checkout</p>
                <p className="text-[10px] text-on-surface-variant">SSL Encrypted Booking Flow</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary">Securing Session...</div>}>
      <BookingContent />
    </Suspense>
  );
}
