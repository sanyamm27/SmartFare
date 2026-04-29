export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 relative z-10 print:hidden mt-auto w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
           <h3 className="text-white font-bold mb-4 tracking-widest uppercase text-sm">Links</h3>
           <ul className="space-y-3 text-sm">
             <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
           </ul>
        </div>
        <div>
           <h3 className="text-white font-bold mb-4 tracking-widest uppercase text-sm">Support</h3>
           <ul className="space-y-3 text-sm">
             <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">Baggage Policy</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">Refund Status</a></li>
           </ul>
        </div>
        <div>
           <h3 className="text-white font-bold mb-4 tracking-widest uppercase text-sm">Connect</h3>
           <div className="flex gap-4">
             <a href="#" className="hover:text-white transition-colors" title="LinkedIn">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.96 0-1.5-.64-1.5-1.4 0-.78.56-1.42 1.52-1.42s1.5.64 1.5 1.42c0 .76-.54 1.4-1.52 1.4zm10.5 11.27h-3v-5.59c0-1.4-.5-2.36-1.75-2.36-.96 0-1.53.64-1.78 1.25-.1.22-.12.55-.12.87v5.83h-3s.04-9.06 0-10h3v1.42c.4-.61 1.1-1.49 2.7-1.49 1.97 0 3.45 1.29 3.45 4.06v6.01z"/></svg>
             </a>
             <a href="#" className="hover:text-white transition-colors" title="Twitter(X)">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.95 4.57c-.88.39-1.83.65-2.83.77 1.01-.61 1.79-1.57 2.16-2.72-.95.56-2.01.97-3.13 1.19-.9-.96-2.18-1.56-3.59-1.56-2.72 0-4.92 2.2-4.92 4.92 0 .39.04.76.13 1.12-4.08-.2-7.7-2.16-10.13-5.14-.42.73-.66 1.57-.66 2.47 0 1.71.87 3.22 2.19 4.1-.8-.03-1.56-.25-2.22-.61v.06c0 2.38 1.69 4.37 3.94 4.82-.41.11-.85.17-1.3.17-.32 0-.62-.03-.92-.09.62 1.96 2.44 3.38 4.6 3.42-1.68 1.32-3.8 2.1-6.1 2.1-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55z"/></svg>
             </a>
             <a href="#" className="hover:text-white transition-colors" title="Instagram">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.69-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zm0-2.16c-3.26 0-3.67.01-4.95.07-4.36.2-6.78 2.62-6.98 6.98-.06 1.28-.07 1.69-.07 4.95s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.36-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.36-2.62-6.78-6.98-6.98-1.28-.06-1.69-.07-4.95-.07zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16-2.76-6.16-6.16-6.16zm0 10.16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-8.6c-.79 0-1.43-.64-1.43-1.43 0-.79.64-1.43 1.43-1.43.79 0 1.43.64 1.43 1.43 0 .79-.64 1.43-1.43 1.43z"/></svg>
             </a>
           </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-left md:text-center text-xs tracking-widest uppercase opacity-50">
         © 2026 SMARTFARE Premium Travel. All rights reserved.
      </div>
    </footer>
  );
}
