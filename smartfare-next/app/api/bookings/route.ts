import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const bookingsRef = collection(db, 'bookings');

    let snapshot;
    if (userId) {
      // Simple single-field query — no composite index required
      const q = query(bookingsRef, where('userId', '==', userId));
      snapshot = await getDocs(q);
    } else {
      snapshot = await getDocs(bookingsRef);
    }

    // Sort client-side by createdAt descending (avoids needing composite index)
    const bookings = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

    console.log(`[API Bookings] Fetched ${bookings.length} booking(s)${userId ? ` for userId=${userId}` : ''}`);
    return NextResponse.json(bookings);

  } catch (error: any) {
    // Log the full error — if it's a Firestore index error, the URL will be in the message
    console.error('GET /api/bookings FULL ERROR:', error?.message || error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { addDoc } = await import('firebase/firestore');
    const json = await req.json();
    const pnr = generatePNR();

    const booking = {
      pnr,
      userId: json.userId || null,
      flightDetails: {
        origin: json.from || 'BOM',
        destination: json.to || 'VTZ',
        date: '2026-10-24',
        time: '15:40',
        flightCode: json.airline || 'AI-000',
      },
      passengers: json.passengers || [{ name: json.passenger || 'GUEST' }],
      seats: json.seats || [],
      extraServices: json.addons || [],
      totalAmount: json.price || 0,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), booking);
    console.log('Booking saved to Firestore! PNR:', pnr, 'Doc ID:', docRef.id);
    return NextResponse.json({ success: true, pnr, id: docRef.id });
  } catch (err: any) {
    console.error('Firestore Save Error:', err?.message || err);
    return NextResponse.json(
      { error: 'Failed to write booking to Firestore.', details: String(err) },
      { status: 500 }
    );
  }
}
