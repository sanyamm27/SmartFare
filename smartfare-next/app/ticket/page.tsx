"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function TicketContent() {
  const searchParams = useSearchParams();
  const pnrParam = searchParams?.get("pnr");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!pnrParam) {
        setError("No PNR provided in URL.");
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "bookings"), where("pnr", "==", pnrParam));
        const snap = await getDocs(q);
        if (snap.empty) {
          setError(`No booking found for PNR: ${pnrParam}`);
        } else {
          setBooking({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch booking");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [pnrParam]);

  const handleDownloadPDF = async () => {
    if (!ticketsRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketsRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SmartFare_Tickets_${pnrParam}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary mt-20">Retrieving Booking Data...</div>;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 mt-20">
        <div className="text-red-500 font-bold text-xl">{error || "Booking not found"}</div>
        <Link href="/" className="px-6 py-2 bg-slate-900 text-white rounded-lg">Return Home</Link>
      </div>
    );
  }

  const { flightDetails, passengers, seats, pnr } = booking;
  const fromCode = flightDetails?.origin || "BOM";
  const toCode = flightDetails?.destination || "VTZ";
  const airline = flightDetails?.flightCode || "AI-000";

  return (
    <>
      <div className="flex-1 flex max-w-7xl mx-auto w-full mt-24 px-4">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans text-sm min-h-[80vh] w-64 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mr-8 print:hidden">
            <div className="flex items-center gap-3 mb-8">
              <img
                alt="Passenger Avatar"
                className="w-10 h-10 rounded-full border-2 border-primary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnGlLnNy6BpDQsrZ-DwVtEJJCvaIoVx7LdliXk5tpMsseA6j88mc6BhYyoNDZhcz8Zh36YI76LYcMRk-aNuiEMzbdWiM89fyqbRMu-i35KndMmN7HjT4HkYfkN2GST4T-R83o67eJRZNhV6CR5B7b_36N6_9W0Q0ziGK3aZ4Ay2qUi90OeHf9FaUl7lRMYZHIGHD0MVKSuKg58B1xwVgazQ8mmcEfv_DVmD6uHuXocBaWe6VzZ2FqWt1rvkvA-n00DigV2dN90UYY"
              />
              <div>
                <div className="text-lg font-bold text-indigo-700">Passenger</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Booking Confirmed</div>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href={`/ticket?pnr=${pnrParam}`}
                className="flex items-center gap-3 px-4 py-3 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-indigo-600 transition-all duration-150"
              >
                <span className="material-symbols-outlined" data-icon="confirmation_number">
                  confirmation_number
                </span>
                Boarding Pass
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
              >
                <span className="material-symbols-outlined" data-icon="luggage">
                  luggage
                </span>
                My Bookings
              </Link>
            </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center pb-20 overflow-hidden">
          <div className="no-print w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-2xl font-bold tracking-tight">Your Digital Boarding Passes</h1>
            <button
              className="bg-primary text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              <span className="material-symbols-outlined text-lg" data-icon="download">
                download
              </span>
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>

          {/* Tickets Container for PDF Capture */}
          <div ref={ticketsRef} className="w-full flex flex-col gap-8 items-center bg-white p-4 -m-4">
            {passengers.map((pax: any, idx: number) => {
              const seat = seats?.[idx] || "UNASSIGNED";
              const qrData = encodeURIComponent(`${pnr} - ${pax.name}`);
              
              return (
                <div key={idx} className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row print:shadow-none print:border print:border-slate-800 print:grayscale break-inside-avoid shrink-0">
                  {/* Main Ticket */}
                  <div className="flex-[2.5] p-8 relative">
                    {/* Brand Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-extrabold text-on-surface tracking-tighter uppercase italic">
                          {airline.split('-')[0]}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Economy Class</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Booking Reference</p>
                        <p className="font-mono text-lg font-bold text-primary print:text-black bg-surface-container-low print:bg-transparent px-3 py-1 rounded-md">{pnr}</p>
                      </div>
                    </div>

                    {/* Journey Detail */}
                    <div className="flex justify-between items-center mb-12">
                      <div className="flex flex-col">
                        <span className="text-6xl font-black tracking-tighter">{fromCode}</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-8">
                        <div className="w-full flex items-center gap-2">
                          <div className="h-[2px] bg-slate-200 flex-1"></div>
                          <span className="material-symbols-outlined text-slate-400 transform rotate-90" data-icon="flight">
                            flight
                          </span>
                          <div className="h-[2px] bg-slate-200 flex-1"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Flight {airline}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-6xl font-black tracking-tighter">{toCode}</span>
                      </div>
                    </div>

                    {/* Passenger Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Passenger Name</p>
                        <p className="font-bold text-lg leading-tight uppercase font-mono line-clamp-1">{pax.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gate</p>
                        <p className="font-bold text-lg leading-tight font-mono text-primary print:text-black">T2</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Boarding Time</p>
                        <p className="font-bold text-lg leading-tight font-mono">08:45 AM</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Departure</p>
                        <p className="font-bold text-lg leading-tight font-mono">{flightDetails?.time || "09:30 AM"}</p>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-end justify-between">
                      <div className="flex gap-12 border border-slate-200 px-6 py-3 rounded-xl bg-slate-50 print:bg-white print:border-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Seat</span>
                          <span className="font-mono text-3xl font-bold text-indigo-700 print:text-black">{seat}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Zone</span>
                          <span className="font-mono text-3xl font-bold">2</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <img
                          alt="Barcode"
                          className="h-16 grayscale opacity-80"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAomvbB_pfHzMrIyUKbQWC2UmgQdG-dw2RgmNUuibENnDGdjaH8_wgy4ZlpA3bbnLXoS0kM4SXipUaZYjO0oFBMoCekWLSqEMpA7g1NfC6ipgij_MUoIEph3mQwl1wU86fNOMaGJSWuFVISOZ41ziXoj4PFUSAM1nmjuoFedG7AKrfiMhDfRXvNrPMBL-wj8ODwjLmm0QbLdRHrlvyw57EMEc7l-8GvM2MsmYvM-b_wu9hlLga8rlppG0r4gCtAvD3vMKOZVrRFAeA"
                        />
                        <span className="font-mono text-[10px] mt-1 tracking-[0.4em] text-slate-400">{pnr}-{idx}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Divider */}
                  <div
                    className="w-[2px] hidden md:block print:hidden"
                    style={{
                      backgroundImage: "linear-gradient(to bottom, #cbd5e1 50%, rgba(255,255,255,0) 0%)",
                      backgroundPosition: "right",
                      backgroundSize: "2px 12px",
                      backgroundRepeat: "repeat-y"
                    }}
                  ></div>
                  <div className="w-[1px] hidden md:block print:block bg-slate-300 hidden"></div>
                  <div className="h-[2px] w-full border-t-2 border-dashed border-slate-300 md:hidden print:block print:w-[1px] print:h-full"></div>

                  {/* Passenger Stub */}
                  <div className="flex-1 bg-slate-50 print:bg-white p-8 border-l border-slate-100 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 hidden print:block text-[8px] text-slate-400 rotate-90 origin-top-right">✂ TEAR HERE</div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">{airline.split('-')[0]}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Passenger Receipt</p>
                    </div>

                    <div className="space-y-4 mb-8 z-10">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Passenger</p>
                        <p className="font-bold text-sm leading-tight uppercase line-clamp-1">{pax.name}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Flight</p>
                          <p className="font-bold text-sm leading-tight">{airline}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Seat</p>
                          <p className="font-mono font-bold text-sm leading-tight text-primary print:text-black">{seat}</p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">From</p>
                          <p className="font-bold text-sm leading-tight">{fromCode}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">To</p>
                          <p className="font-bold text-sm leading-tight">{toCode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col items-center">
                      {/* Dynamic QR Code from API */}
                      <img
                        alt="QR Code"
                        crossOrigin="anonymous"
                        className="w-24 h-24 border border-slate-200 p-1 bg-white"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`}
                      />
                      <p className="font-mono text-[8px] mt-2 text-slate-400">PNR: {pnr}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 print:hidden flex justify-center">
            <Link
              href="/"
              className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-secondary transition-all shadow-lg hover:shadow-xl"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default function Ticket() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary mt-20">Loading Boarding Pass...</div>}>
      <TicketContent />
    </Suspense>
  );
}
