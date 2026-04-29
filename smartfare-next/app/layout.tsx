import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SMARTFARE | Premium Flight Search",
  description: "Experience seamless travel with AI-powered flight predictions and premium comfort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-container-low text-on-surface min-h-screen">
        <AuthProvider>
          <Header />
          <div className="pt-20 print:pt-0 flex-1 flex flex-col min-h-[calc(100vh-80px)]">
            {children}
            <Footer />
          </div>
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}

