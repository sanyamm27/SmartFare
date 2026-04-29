import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const { pnr } = await params;
    const upperPnr = pnr.toUpperCase();

    if (!/^[A-Z0-9]{6,10}$/.test(upperPnr)) {
      return NextResponse.json({ error: 'Invalid PNR format' }, { status: 400 });
    }

    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('pnr', '==', upperPnr));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const rawData = doc.data();
    
    // Optimized payload
    const bookingData = {
      id: doc.id,
      status: rawData.status,
      createdAt: rawData.createdAt,
      flightDetails: rawData.flightDetails
    };
    
    return NextResponse.json(bookingData);
  } catch (err: any) {
    console.error('GET /api/bookings/[pnr] error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
