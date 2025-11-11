"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, Layers, FileBarChart2, Settings, Brain } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rg97", label: "RG97", icon: Shield },
  { href: "/ter", label: "TER", icon: Layers },
  { href: "/mysuper", label: "MySuper", icon: FileBarChart2 },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 shrink-0 border-r border-qic-secondary-slate/15 bg-white/90 backdrop-blur-sm">
      {/* Header / Logo (compact) */}
      <div className="flex flex-col items-center gap-2 px-3 py-4">
        <Brain className="h-7 w-7 text-qic-corp-red" />
      </div>

      {/* Nav Links (compact grid) */}
      <nav className="flex flex-col items-center justify-center space-y-2 pt-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-all duration-200",
                active
                  ? "bg-qic-corp-red text-white shadow-sm"
                  : "text-qic-secondary-slate hover:bg-qic-secondary-sand-20 hover:text-qic-corp-red"
              )}
              title={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={clsx(
                  "h-5 w-5 transition-colors",
                  active ? "text-white" : "text-qic-secondary-slate group-hover:text-qic-corp-red"
                )}
              />
              <span
                className={clsx(
                  "text-[10px] leading-none transition-colors",
                  active ? "text-white" : "text-qic-secondary-slate/70 group-hover:text-qic-corp-red"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
