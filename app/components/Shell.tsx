"use client";

import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      {/* Top Nav */}
      <header className="flex-none border-b border-qic-corp-red/40 bg-qic-corp-red text-white">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: static icon (no toggle) */}
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </div>

          {/* Center: title */}
          <div className="font-heading text-lg tracking-wide">Project Synapse</div>

          {/* Right: user */}
          <div className="text-xs font-sans opacity-80">Brendan O&apos;Connor</div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <section className="flex-1 overflow-auto bg-qic-secondary-sand-20 p-6">
          {children}
        </section>
      </main>
    </div>
  );
}
