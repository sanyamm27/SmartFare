import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "mock-key");

interface EmailParams {
  to: string;
  pnr: string;
  flightDetails: {
    origin: string;
    destination: string;
    date: string;
    flightCode: string;
  };
  passengers: Array<{ name: string }>;
}
/**
 * Dispatches an automated, branded HTML confirmation email upon a successful booking.
 * Utilizes the Resend SDK to transmit the email, embedding dynamic data such as PNR,
 * flight details, and passenger lists. Features a fail-safe mock mode if the API key is missing.
 * 
 * @param {EmailParams} params - The booking details and recipient email address.
 * @returns {Promise<{success: boolean, data?: any, mocked?: boolean, error?: any}>} The result of the email dispatch.
 */
export async function sendConfirmationEmail({ to, pnr, flightDetails, passengers }: EmailParams) {
  const passengerListHTML = passengers
    .map((p) => `<li style="margin-bottom: 4px;"><strong>${p.name}</strong></li>`)
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SmartFare</h1>
        <p style="color: #c7d2fe; margin-top: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Digital Boarding Pass</p>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Pack your bags!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Your booking is fully confirmed. Here are the details of your upcoming journey:
        </p>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
          <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 4px 0;">Booking Reference (PNR)</p>
            <p style="font-size: 24px; font-weight: 900; color: #4f46e5; margin: 0; letter-spacing: 2px;">${pnr}</p>
          </div>

          <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
            <div>
              <p style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 4px 0;">Flight Route</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${flightDetails.origin} &rarr; ${flightDetails.destination}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 4px 0;">Flight / Date</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${flightDetails.flightCode} / ${flightDetails.date}</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">Passengers</h3>
          <ul style="color: #475569; font-size: 15px; padding-left: 20px; margin: 0;">
            ${passengerListHTML}
          </ul>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">Baggage Allowance</h3>
          <div style="display: flex; gap: 16px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; flex: 1;">
              <p style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 4px 0;">Check-in</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">15 kg</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; flex: 1;">
              <p style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 4px 0;">Cabin</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">7 kg</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:3000/ticket?pnr=${pnr}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">View & Download Digital Ticket</a>
        </div>
      </div>
      
      <div style="background-color: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0; font-weight: bold; color: #ef4444; margin-bottom: 8px;">Important: Please reach the airport 2 hours before departure.</p>
        <p style="margin: 0;">Thank you for flying with SmartFare.</p>
      </div>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "mock-key") {
    console.log("----------------------------------------------------------");
    console.log(`[Email Mock] API Key missing. Simulating send to: ${to}`);
    console.log(`[Email Mock] Subject: Pack your bags! Your SmartFare Booking ${pnr} is Confirmed`);
    console.log("----------------------------------------------------------");
    return { success: true, mocked: true };
  }

  console.log(`[Email] RESEND_API_KEY found (length: ${apiKey.length}). Attempting to send real email to ${to}...`);

  try {
    const data = await resend.emails.send({
      from: "SmartFare <onboarding@resend.dev>",
      to,
      subject: `Pack your bags! Your SmartFare Booking ${pnr} is Confirmed`,
      html: htmlContent,
    });
    console.log("[Email] Email sent successfully to:", to, "ID:", data.data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("[Email Error] Failed to send email:", error);
    return { success: false, error };
  }
}
