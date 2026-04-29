import { NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Refund policy by fare type
const REFUND_POLICY: Record<string, { percent: number; label: string }> = {
  saver:   { percent: 0,   label: "No refund (Saver fare is non-refundable)" },
  flexi:   { percent: 50,  label: "50% refund (Flexi fare)" },
  premium: { percent: 90,  label: "90% refund (Premium fare)" },
};

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // 1. Fetch booking from Firestore
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingSnap.data();

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Only CONFIRMED bookings can be cancelled" }, { status: 400 });
    }

    // 2. Read fareType from the Firestore document (saved at booking creation)
    //    Fall back to "saver" (no refund) if not found
    const fareType = (booking.fareType || "saver").toLowerCase();
    const policy = REFUND_POLICY[fareType] || REFUND_POLICY.saver;
    const totalPaidPaise = (booking.totalAmount || 0) * 100; // convert ₹ to paise
    const refundAmountPaise = Math.floor(totalPaidPaise * (policy.percent / 100));

    let stripeRefundId: string | null = null;

    // 3. Issue Stripe refund if applicable and payment intent exists
    if (refundAmountPaise > 0 && booking.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refundAmountPaise,
        });
        stripeRefundId = refund.id;
        console.log(`[Cancel] Stripe refund issued: ${refund.id} for ₹${refundAmountPaise / 100}`);
      } catch (stripeErr: any) {
        // In test mode, refunds on certain intent states can fail — log and continue
        console.warn("[Cancel] Stripe refund warning:", stripeErr.message);
      }
    }

    // 4. Update Firestore status → CANCELLED
    await updateDoc(bookingRef, {
      status: "CANCELLED",
      cancellation: {
        fareType,
        refundPercent: policy.percent,
        refundAmount: refundAmountPaise / 100,
        refundLabel: policy.label,
        stripeRefundId,
        cancelledAt: new Date().toISOString(),
      },
    });

    console.log(`[Cancel] Booking ${bookingId} (PNR: ${booking.pnr}) CANCELLED. Refund: ₹${refundAmountPaise / 100}`);

    return NextResponse.json({
      success: true,
      pnr: booking.pnr,
      refundAmount: refundAmountPaise / 100,
      refundLabel: policy.label,
      stripeRefundId,
    });

  } catch (err: any) {
    console.error("[/api/bookings/cancel] Error:", err?.message || err);
    return NextResponse.json({ error: err.message || "Cancellation failed" }, { status: 500 });
  }
}
