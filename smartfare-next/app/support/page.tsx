"use client";

import { useState } from "react";

export default function Support() {
  const [sent, setSent] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">How can we help?</h1>
        <p className="text-on-surface-variant text-lg">Detailed support and contact options for your peace of mind.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* FAQ Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">lightbulb</span> Frequently Asked Questions
          </h2>
          
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-on-surface">How do I cancel my ticket?</h3>
            <p className="text-sm text-on-surface-variant mt-2">
              Navigate to "My Bookings" and select the flight you wish to modify. Click "Cancel Booking". Refunds are processed according to your fare type.
            </p>
          </div>
          
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-on-surface">What are the baggage allowances?</h3>
            <p className="text-sm text-on-surface-variant mt-2">
              Economy standard fares allow 1 Checked Bag (15kg) and 1 Cabin Bag (7kg). Premium Class allows 2 Checked Bags (30kg combined). 
            </p>
          </div>

          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-on-surface">Can I change my name on the ticket?</h3>
            <p className="text-sm text-on-surface-variant mt-2">
              Minor corrections (up to 3 characters) are free. Complete name changes require a rebooking subject to current pricing differences.
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl shadow-lg p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">mail</span> Contact Us
          </h2>
          
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-green-600">check_circle</span>
              <h3 className="font-bold text-lg">Message Received</h3>
              <p className="text-sm">We'll get back to you within 24 hours.</p>
              <button 
                className="mt-6 font-semibold text-primary hover:underline text-sm"
                onClick={() => setSent(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com" 
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Subject</label>
                <select className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                  <option>Booking Modification</option>
                  <option>Refund Inquiry</option>
                  <option>Technical Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="How can we help you today?" 
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-secondary transition-all flex justify-center items-center gap-2 active:scale-95"
              >
                Send Message <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
