# SmartFare - Flight Booking Platform

A full-stack Next.js application designed for the Indian market featuring real-time flight search, multi-passenger booking, and automated ticketing.

## Features
- **Dynamic Search:** Seamlessly search for flights and view comprehensive route options.
- **Multi-Passenger Booking:** Easily add multiple passengers and their details within a single booking flow.
- **Stripe India Integration:** Support for standard Cards and explicit UPI support optimized for INR transactions.
- **Mock Net Banking:** A simulated portal featuring major Indian banks (SBI, HDFC, ICICI, Axis) for demo purposes, fully bypassing Stripe to trigger instant confirmation.
- **Dynamic PDF Ticket Generation:** Uses `jspdf` and `html2canvas` to render high-resolution, multi-page digital boarding passes dynamically mapped from Firestore passenger data.
- **Email Confirmations:** Automated, branded HTML emails sent directly to the traveler via **Resend**, featuring dynamic PNRs and a "View Ticket" quick-link.
- **AI-Powered Assistance:** Integration of Gemini 2.5 Flash for real-time customer support, featuring automated handling of baggage policies and PNR tracking directly via the AI interface.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Firebase (Firestore & Firebase Auth)
- **Payments:** Stripe Elements
- **Email Delivery:** Resend
- **PDF Generation:** jsPDF & html2canvas

## Architectural Highlights
- **Resilient AI Layer:** Implements asynchronous retry loops and custom back-off logic to gracefully handle Gemini API 503 (High Demand) spikes, ensuring uninterrupted concierge service.
- **Fast-Path Route Analysis:** Optimizes Next.js App Router transitions by eliminating artificial UI delays and utilizing dynamic imports for heavy AI libraries to achieve near-instant perceived latency.

## Setup Guide

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/smartfare-next.git
cd smartfare-next
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory. You will need to add your API keys. **Never commit this file to GitHub!**

\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend Email Configuration
RESEND_API_KEY=re_...
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

## Developer Notes & Troubleshooting
- **PDF Rendering Fix:** A critical crash occurred in `html2canvas` when attempting to parse modern CSS color functions like `lab()`. This was resolved by standardizing the global UI palette back to explicit HEX/RGB values, ensuring cross-browser PDF generation stability.
- **Firestore Optimization:** PNR queries in the bookings API were refactored to retrieve only essential data fragments (Status, Time, FlightID) instead of full payloads, significantly reducing edge latency and egress costs.

---

## License
Distributed under the MIT License.

## Contact
Sanyam Kumar - [LinkedIn](https://linkedin.com) - sanyamkumar316@gmail.com
