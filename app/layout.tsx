import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Synapse – Visualiser",
  description: "ETR (TER, MySuper, RG97) visualisation workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
