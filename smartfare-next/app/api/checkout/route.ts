import { NextResponse } from "next/server";
import Stripe from "stripe";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const generatePNR = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

/**
 * Handles the initialization of a Stripe Checkout Session.
 * Creates a PENDING booking document in Firestore and returns a client secret
 * to the frontend to securely complete the payment via Stripe Elements.
 * 
 * @param {Request} req - The incoming Next.js request containing booking payload.
 * @returns {NextResponse} JSON containing the Stripe clientSecret and booking details.
 */
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
    } = body;

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. Create Stripe PaymentIntent with forced UPI
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "inr",
      payment_method_types: ["card", "upi"],
      metadata: { userId: userId || "guest", from, to },
    });

    // 2. Create a PENDING booking in Firestore
    const pnr = generatePNR();
    const resolvedPassenger = passengerName || (passengers?.[0]?.name) || "Unknown Passenger";
    const booking = {
      pnr,
      userId: userId || null,
      stripePaymentIntentId: paymentIntent.id,
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
      status: "PENDING",
      createdAt: new Date().toISOString(),
      email: body.email || "guest@example.com",
    };

    const docRef = await addDoc(collection(db, "bookings"), booking);
    console.log("[Checkout] PENDING booking created. PNR:", pnr, "Doc:", docRef.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      pnr,
      bookingId: docRef.id,
    });
  } catch (err: any) {
    console.error("[/api/checkout] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
