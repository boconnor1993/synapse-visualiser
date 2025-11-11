// app/rg97/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../components/Shell";
import Badge from "../components/Badge";
import {
  mockRequests,
  clients as allClients,
  RequestItem,
} from "../lib/data";
import { Plus, RefreshCcw } from "lucide-react";
import clsx from "clsx";
import RequestModal from "./components/RequestModal";

/* ------------------------------ Helpers ------------------------------ */
const fmtISO = (d: Date) => d.toISOString().slice(0, 10);
const today = () => fmtISO(new Date());
const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return fmtISO(d);
};

// Parse YYYY-MM-DD safely
function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function fmtMMMYY(iso: string): string {
  const dt = parseISODateLocal(iso);
  const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mm = shortMonths[dt.getMonth()];
  const yy = String(dt.getFullYear()).slice(-2);
  return `${mm}-${yy}`;
}

/* ------------------------------ PAGE ------------------------------ */

// Add optional fields so roll-forward can use them safely
type ExtendedRequestItem = RequestItem & {
  products?: string[];
  teams?: string[];
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
};

export default function RG97Page() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    client: "All",
    quarter: "All",
    status: "All",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "roll">("new");
  const [initialForm, setInitialForm] = useState<Partial<RequestFormValues> | null>(null);

  const rg97: ExtendedRequestItem[] = useMemo(
    () => mockRequests.filter((r) => r.type === "RG97"),
    []
  );

  const clients = allClients;
  const quarters = Array.from(new Set(rg97.map((r) => r.quarterEnd))).sort();
  const statuses = Array.from(new Set(rg97.map((r) => r.status)));

  const filtered = useMemo(() => {
    return rg97.filter((r) => {
      if (filters.client !== "All" && r.client !== filters.client) return false;
      if (filters.quarter !== "All" && r.quarterEnd !== filters.quarter) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;
      return true;
    });
  }, [filters, rg97]);

  function openNew() {
    setModalMode("new");
    setInitialForm({
      requestDate: today(),
      dueDate: plusDays(14),
    });
    setModalOpen(true);
  }

  function openRollForward(fromId: string) {
    const src = rg97.find((r) => r.id === fromId);
    if (!src) return;

    const prior: Partial<RequestFormValues> = {
      client: src.client,
      products: src.products ?? [],
      teams: src.teams ?? [],
      periodStart: src.periodStart ?? "",
      periodEnd: src.periodEnd ?? "",
      requestDate: today(),
      dueDate: plusDays(14),
      notes: src.notes
        ? `Rolled forward from ${src.id} (prev notes below)\n\n${src.notes}`
        : `Rolled forward from ${src.id} (Quarter End: ${src.quarterEnd})`,
    };

    setModalMode("roll");
    setInitialForm(prior);
    setModalOpen(true);
  }

  return (
    <Shell>
      <h1 className="text-2xl font-heading text-qic-secondary-slate">RG97</h1>

      {/* Filters + Button */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="Client"
            value={filters.client}
            options={["All", ...clients]}
            onChange={(v) => setFilters((f) => ({ ...f, client: v }))}
          />
          <FilterSelect
            label="Quarter"
            value={filters.quarter}
            options={["All", ...quarters]}
            onChange={(v) => setFilters((f) => ({ ...f, quarter: v }))}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={["All", ...statuses]}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-qic-corp-red px-3 py-2 text-sm font-medium text-white hover:bg-qic-corp-red/80"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-qic-secondary-slate-20 font-heading text-qic-secondary-slate">
            <tr>
              <th className="px-4 py-2 text-left">Request</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Quarter End</th>
              <th className="px-4 py-2 text-left">Request Date</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/rg97/${r.id}`)}
                className={clsx(
                  "cursor-pointer border-t transition-colors hover:bg-qic-corp-red-20/30"
                )}
              >
                <td className="px-4 py-2">{r.requestName}</td>
                <td className="px-4 py-2">{r.client}</td>
                <td className="px-4 py-2 whitespace-nowrap">{fmtMMMYY(r.quarterEnd)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.requestDate ?? "—"}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.dueDate}</td>
                <td className="px-4 py-2">
                  <Badge label={r.status} />
                </td>
                <td className="px-4 py-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-qic-secondary-slate/20 bg-white px-2 py-1 text-xs text-qic-secondary-slate hover:bg-qic-secondary-sand-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRollForward(r.id);
                    }}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Roll forward
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-qic-secondary-slate/60"
                >
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <RequestModal
          mode={modalMode}
          initial={initialForm ?? undefined}
          clients={clients}
          onClose={() => setModalOpen(false)}
          onSubmit={(values) => {
            console.log(`[${modalMode.toUpperCase()}]`, values);
            setModalOpen(false);
          }}
        />
      )}
    </Shell>
  );
}

/* --------------------------- Types for the form --------------------------- */
type RequestFormValues = {
  client: string;
  products: string[];
  teams: string[];
  periodStart: string;
  periodEnd: string;
  requestDate: string;
  dueDate: string;
  notes?: string;
};

/* ----------------------------- Filter Select ------------------------------ */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-qic-secondary-slate/80">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-qic-secondary-slate/20 bg-white px-2 py-1 text-sm text-qic-secondary-slate focus:outline-none focus:ring-2 focus:ring-qic-corp-red/50"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
