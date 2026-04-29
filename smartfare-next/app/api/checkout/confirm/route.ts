import { NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { paymentIntentId, bookingId } = await req.json();

    // 1. Verify payment succeeded with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment not confirmed by Stripe. Status: ${intent.status}` },
        { status: 400 }
      );
    }

    let pnr = "";
    let bookingData: any = null;

    if (bookingId) {
      // Fast path: we have the exact Firestore doc ID — direct update, no query
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        console.error("[Confirm] Booking doc not found for ID:", bookingId);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      pnr = bookingSnap.data().pnr || "";
      bookingData = bookingSnap.data();
      await updateDoc(bookingRef, { status: "CONFIRMED" });
      console.log("[Confirm] ✅ Booking CONFIRMED via bookingId:", bookingId, "PNR:", pnr);

    } else {
      // Fallback: search by stripePaymentIntentId (slower, but safe)
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(
        collection(db, "bookings"),
        where("stripePaymentIntentId", "==", paymentIntentId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.error("[Confirm] No booking found for paymentIntentId:", paymentIntentId);
        return NextResponse.json({ error: "Booking not found in Firestore" }, { status: 404 });
      }

      const bookingDoc = snapshot.docs[0];
      bookingData = bookingDoc.data();
      pnr = bookingData.pnr || "";
      await updateDoc(doc(db, "bookings", bookingDoc.id), { status: "CONFIRMED" });
      console.log("[Confirm] ✅ Booking CONFIRMED via query. PNR:", pnr);
    }

    // Trigger Email
    if (bookingData) {
      const { sendConfirmationEmail } = await import("@/lib/utils/sendEmail");
      await sendConfirmationEmail({
        to: bookingData.email || "guest@example.com",
        pnr,
        flightDetails: bookingData.flightDetails,
        passengers: bookingData.passengers,
      });
    }

    return NextResponse.json({ success: true, pnr });
  } catch (err: any) {
    console.error("[/api/checkout/confirm] Error:", err?.message || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
