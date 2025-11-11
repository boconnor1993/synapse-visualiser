import Shell from "./components/Shell";
import Link from "next/link";
import { mockRequests } from "./lib/data";

export default function HomePage() {
  const counts = {
    rg97: mockRequests.filter(r => r.type === "RG97" && r.status !== "Closed").length,
    ter: mockRequests.filter(r => r.type === "TER" && r.status !== "Closed").length,
    mysuper: mockRequests.filter(r => r.type === "MySuper" && r.status !== "Closed").length,
  };

  return (
    <Shell>
      <h1 className="mb-6 text-2xl font-heading text-qic-secondary-slate">Overview</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Tile href="/rg97" title="RG97" count={counts.rg97} tone="red" />
        <Tile href="/ter" title="TER" count={counts.ter} tone="gold" />
        <Tile href="/mysuper" title="MySuper" count={counts.mysuper} tone="sand" />
      </div>
    </Shell>
  );
}

function Tile({
  href,
  title,
  count,
  tone,
}: {
  href: string;
  title: string;
  count: number;
  tone: "red" | "gold" | "sand";
}) {
  // fixed class maps (no dynamic template strings)
  const WRAPS: Record<typeof tone, string> = {
    red:  "bg-qic-corp-red-20 ring-1 ring-qic-corp-red-60/30",
    gold: "bg-qic-primary-gold-20 ring-1 ring-qic-primary-gold-60/30",
    sand: "bg-qic-secondary-sand-20 ring-1 ring-qic-secondary-sand-60/30",
  };
  const HEADS: Record<typeof tone, string> = {
    red:  "text-qic-corp-red",
    gold: "text-qic-primary-gold",
    sand: "text-qic-secondary-slate",
  };

  return (
    <Link
      href={href}
      className={`group block rounded-xl2 p-5 shadow-sm transition hover:shadow-md ${WRAPS[tone]}`}
    >
      <div className={`text-lg font-heading ${HEADS[tone]}`}>{title}</div>
      <div className="mt-6 flex items-baseline justify-between">
        <div className={`text-4xl font-heading ${HEADS[tone]}`}>{count}</div>
        <div className="text-xs uppercase tracking-wide text-qic-secondary-slate/70 group-hover:text-qic-secondary-slate">
          Active requests →
        </div>
      </div>
    </Link>
  );
}
