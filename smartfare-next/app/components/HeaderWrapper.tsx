"use client";

// HeaderWrapper lets us pass auth context to Header without breaking
// layout.tsx's Server Component status.
import Header from "./Header";

export default function HeaderWrapper() {
  return <Header />;
}
