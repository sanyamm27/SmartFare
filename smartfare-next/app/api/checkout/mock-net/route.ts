import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const generatePNR = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      userId,
      airline,
      from,
      to,
      passengerName,
      passengers,
      seats,
      addons,
      fareType,
      bankName
    } = body;

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const pnr = generatePNR();
    const resolvedPassenger = passengerName || (passengers?.[0]?.name) || "Unknown Passenger";
    
    // Create a CONFIRMED booking directly to bypass Stripe
    const booking = {
      pnr,
      userId: userId || null,
      stripePaymentIntentId: `mock_netbanking_${bankName}_${Date.now()}`,
      flightDetails: {
        origin: from || "BOM",
        destination: to || "VTZ",
        date: "2026-10-24",
        time: "15:40",
        flightCode: airline || "AI-000",
      },
      passengers: passengers && passengers.length > 0 ? passengers : [{ name: resolvedPassenger }],
      seats: seats || [],
      extraServices: addons || [],
      fareType: fareType || "Saver",
      totalAmount: Math.round(amount / 100),
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "bookings"), booking);
    console.log("[Mock Checkout] ✅ CONFIRMED booking created via NetBanking. PNR:", pnr, "Doc:", docRef.id);

    // Trigger Email
    const { sendConfirmationEmail } = await import("@/lib/utils/sendEmail");
    await sendConfirmationEmail({
      to: body.email || "guest@example.com",
      pnr,
      flightDetails: booking.flightDetails,
      passengers: booking.passengers,
    });

    return NextResponse.json({
      success: true,
      pnr,
      bookingId: docRef.id,
    });
  } catch (err: any) {
    console.error("[/api/checkout/mock-net] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
