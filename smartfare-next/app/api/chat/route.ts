import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `You are SkyGuide, the premium AI concierge for SmartFare. You help users book flights, select seats, understand refund policies, and cancel bookings. Keep responses extremely concise to minimize response latency.

Refund & Cancellation Policy:
- Saver fare: Non-refundable. 0% refund on cancellation.
- Flexi fare: 50% refund on cancellation, credited within 5–7 business days.
- Premium fare: 90% refund on cancellation, credited within 5–7 business days.

If a user asks about cancelling a booking, ask them for their PNR code and their fare type (Saver/Flexi/Premium). Then explain the refund they are entitled to. Direct them to click "Cancel Booking" on the My Bookings page.

Seat pricing: Economy seats ₹400–₹900. Promo codes: HDFC1000 (₹1000 off), AXIS200 (₹200 off).

Baggage Policy (SmartFare Standards):
- Cabin Baggage: 1 piece (up to 7kg) + 1 small personal item (handbag/laptop bag).
- Check-in Baggage (Domestic): Economy: 15kg | Business: 35kg.
- Check-in Baggage (International): Economy: 23kg | Business: 35kg.
- Excess Baggage Fee: ₹500 per kg for domestic travel.
- Restricted Items: Power banks and lithium batteries MUST be in cabin luggage. Liquids >100ml are prohibited in the cabin.
*DO NOT redirect users to external sites for baggage info.

PDF & Rendering Troubleshooting:
If a user reports an error like "Attempting to parse an unsupported color function 'lab'" during ticket download:
- Diagnose: Explain that the html2canvas library does not support modern CSS color functions like lab() or oklch().
- Solution: Advise the user to check the globals.css or the ticket component and replace any lab() colors with standard HEX (#FFFFFF) or RGB values.

Be professional and concise.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const { messages, contextPath } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Embed current route context into the system logic
    let contextualMessage = "";
    if (contextPath?.includes('/services')) {
      contextualMessage = `[System Note: The user is currently on the Seat and Add-ons Selection page. Provide seat map mapping or luggage tips if relevant to their next question.]\n\n`;
    } else if (contextPath?.includes('/booking') || contextPath?.includes('/checkout')) {
      contextualMessage = `[System Note: The user is currently on the final Checkout Payment page.]\n\n`;
    } else if (contextPath === '/') {
      contextualMessage = `[System Note: The user is on the main Flight Search Homepage.]\n\n`;
    }

    // Dynamic Firestore Context Injection for PNR tracking
    const pnrMatch = messages[messages.length - 1].text.match(/\b([A-Z0-9]{6,10})\b/i);
    if (pnrMatch) {
      const pnrCode = pnrMatch[1].toUpperCase();
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const q = query(collection(db, 'bookings'), where('pnr', '==', pnrCode));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const rawRecord = snapshot.docs[0].data();
          const bookingRecord = {
            status: rawRecord.status,
            flightId: rawRecord.flightDetails?.flightCode,
            time: rawRecord.createdAt,
            pnr: rawRecord.pnr
          };
          contextualMessage += `[System Note: The user provided PNR ${pnrCode}. I found this booking in Firestore: ${JSON.stringify(bookingRecord)}. Inform the user of their specific seats, addons, and passenger details accurately!]\n\n`;
        } else {
          contextualMessage += `[System Note: The user provided PNR ${pnrCode}, but it was NOT FOUND in the Firestore database. You must state 'Not Found' and do not generate placeholder data.]\n\n`;
        }
      } catch (err) {
        console.error("Context Firestore fetch error:", err);
      }
    }

    const rawHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.sender === 'bot' || m.sender === 'model' ? 'model' : 'user',
      text: m.text || ""
    })).filter((m: any) => m.text.trim() !== "");

    let history: any[] = [];
    for (const msg of rawHistory) {
      if (history.length === 0) {
        if (msg.role === 'model') continue; // Drop leading model messages
        history.push({ role: msg.role, parts: [{ text: msg.text }] });
      } else {
        const last = history[history.length - 1];
        if (last.role === msg.role) {
          last.parts[0].text += "\n" + msg.text; // Fold consecutive roles together
        } else {
          history.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
      }
    }

    const latestUserMessage = messages[messages.length - 1];
    const latestText = contextualMessage + latestUserMessage.text;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      systemInstruction: SYSTEM_INSTRUCTION 
    });
    
    const chat = model.startChat({ history });

    const attemptCall = async (retryCount = 0): Promise<Response> => {
      try {
        const result = await chat.sendMessageStream(latestText);
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                controller.enqueue(new TextEncoder().encode(text));
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (err: any) {
        const errorString = String(err).toLowerCase();
        const isHighDemandError = err.status === 503 || errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('high demand');
        
        if (isHighDemandError) {
          if (retryCount < 1) {
            console.log("Gemini 503/High Demand detected. Retrying in 1500ms...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            return attemptCall(retryCount + 1);
          } else {
            console.warn("Gemini persistent 503. Serving fallback response.");
            const fallbackText = "SmartFare is currently optimizing its connection to the flight network. Please wait a few seconds and try again. For urgent flight changes, contact us at 1800-SMART-FLY.";
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode(fallbackText));
                controller.close();
              }
            });
            return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
          }
        }
        
        throw err;
      }
    };

    return await attemptCall(0);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Connection error", details: String(error) }, { status: 500 });
  }
}
