// app/rg97/components/RequestModal.tsx
"use client";

import { useMemo, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { clientProducts, productTeams, ALWAYS_TEAMS } from "@/app/lib/data";

type Mode = "new" | "roll";

export type RequestFormValues = {
  client: string;
  products: string[];
  teams: string[];
  periodStart: string;
  periodEnd: string;
  requestDate: string;
  dueDate: string;
  notes?: string;
};

type Props = {
  mode: Mode;
  initial?: Partial<RequestFormValues>;
  clients: string[];
  onClose: () => void;
  onSubmit: (values: RequestFormValues) => void;
};

// --- Local, timezone-safe YYYY-MM-DD ---
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmtLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const today = () => fmtLocal(new Date());
const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return fmtLocal(d);
};

// Compute the most recent PRIOR calendar quarter range (inclusive, local)
function prevQuarterRange(base: Date) {
  const m = base.getMonth(); // 0..11
  const y = base.getFullYear();
  const currentQ = Math.floor(m / 3); // 0..3
  const prevQ = (currentQ + 3) % 4;
  const yearOfPrev = currentQ === 0 ? y - 1 : y;
  const startMonth = prevQ * 3;
  const start = new Date(yearOfPrev, startMonth, 1);
  const end = new Date(yearOfPrev, startMonth + 3, 0);
  return { startISO: fmtLocal(start), endISO: fmtLocal(end) };
}

export default function RequestModal({
  mode,
  initial,
  clients,
  onClose,
  onSubmit,
}: Props) {
  // ---------- Client ----------
  const [client, setClient] = useState<string>(initial?.client ?? clients[0] ?? "");

  const suggestedProducts = useMemo<string[]>(
    () => clientProducts[client] ?? [],
    [client]
  );

  const [products, setProducts] = useState<string[]>(
    initial?.products && initial.products.length > 0
      ? initial.products
      : suggestedProducts
  );

  const [hasTouchedTeams, setHasTouchedTeams] = useState<boolean>(
    !!(initial?.teams && initial.teams.length > 0)
  );
  const handleClientChange = (next: string) => {
    setClient(next);
    const base = clientProducts[next] ?? [];
    setProducts(base);
    setHasTouchedTeams(false);
  };

  // ---------- Teams ----------
  const allTeams = useMemo<string[]>(
    () =>
      Array.from(
        new Set<string>([
          ...ALWAYS_TEAMS,
          ...Object.values(productTeams).flatMap((arr) => arr),
        ])
      ),
    []
  );

  const suggestedTeams = useMemo<string[]>(
    () =>
      Array.from(
        new Set<string>([
          ...ALWAYS_TEAMS,
          ...products.flatMap((p) => productTeams[p] ?? []),
        ])
      ),
    [products]
  );

  const [teams, setTeams] = useState<string[]>(
    initial?.teams && initial.teams.length > 0 ? initial.teams : suggestedTeams
  );

  const displayTeams = hasTouchedTeams ? teams : suggestedTeams;

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const toggleTeam = (t: string) => {
    setHasTouchedTeams(true);
    setTeams((cur) => toggleArray(cur, t));
  };

  const toggleProduct = (p: string) => {
    setProducts((cur) => toggleArray(cur, p));
  };

  // ---------- Dates & Notes ----------
  const { startISO: defaultQStart, endISO: defaultQEnd } = prevQuarterRange(new Date());
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? defaultQStart);
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? defaultQEnd);
  const [requestDate, setRequestDate] = useState(initial?.requestDate ?? today());
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? plusDays(14));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // ---------- Submit ----------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      client,
      products,
      teams: displayTeams,
      periodStart,
      periodEnd,
      requestDate,
      dueDate,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-xl border border-qic-secondary-slate/15 bg-white shadow-xl">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-qic-secondary-slate/15 bg-white/90 px-5 py-4">
          <h2 className="text-xl font-bold text-qic-secondary-slate">
            {mode === "new" ? "New RG97 Request" : "Roll Forward RG97 Request"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-qic-secondary-slate hover:bg-qic-secondary-sand-20/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {/* Client */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Client Name</h3>
            <select
              value={client}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
            >
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Period Request Dates */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Period Request Dates</h3>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="flex-1 rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
              />
              <span className="text-qic-secondary-slate/70">—</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="flex-1 rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
              />
            </div>
          </div>

          {/* Request Date */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Request Date</h3>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="w-full rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
            />
          </div>

          {/* Due Date */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Due Date</h3>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
            />
          </div>

          {/* Products & Teams */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">
              Products &amp; Responsible Teams
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Products */}
              <div className="rounded-lg border border-qic-secondary-slate/20 bg-white p-4">
                <h4 className="mb-3 font-semibold text-qic-secondary-slate">Requested Products</h4>
                {suggestedProducts.length === 0 ? (
                  <div className="text-sm text-qic-secondary-slate/70">
                    No products configured for this client.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedProducts.map((p) => (
                      <label
                        key={p}
                        className="flex items-center gap-2 rounded-md border border-qic-secondary-slate/20 px-3 py-2 text-sm hover:border-qic-corp-red/40"
                      >
                        <input
                          type="checkbox"
                          checked={products.includes(p)}
                          onChange={() => toggleProduct(p)}
                          className="h-4 w-4 accent-qic-corp-red"
                        />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Teams */}
              <div className="rounded-lg border border-qic-secondary-slate/20 bg-white p-4">
                <h4 className="mb-3 font-semibold text-qic-secondary-slate">Responsible Review Teams</h4>
                <div className="grid grid-cols-1 gap-2">
                  {allTeams.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 rounded-md border border-qic-secondary-slate/20 px-3 py-2 text-sm hover:border-qic-corp-red/40"
                    >
                      <input
                        type="checkbox"
                        checked={displayTeams.includes(t)}
                        onChange={() => toggleTeam(t)}
                        className="h-4 w-4 accent-qic-corp-red"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Notes</h3>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-qic-secondary-slate/30 px-3 py-2 text-sm text-qic-secondary-slate focus:ring-2 focus:ring-qic-corp-red/50"
            />
          </div>

          {/* Attachments */}
          <div>
            <h3 className="mb-2 font-bold text-[17px] text-qic-secondary-slate">Attachments</h3>
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-qic-secondary-slate/30 bg-qic-secondary-sand-20/40 p-6 text-qic-secondary-slate">
              <Paperclip className="h-5 w-5" />
              <div className="text-xs text-qic-secondary-slate/80">
                Drag &amp; drop files here, or{" "}
                <span className="font-medium text-qic-corp-red">choose files</span>
              </div>
              <button
                type="button"
                className="rounded-md border border-qic-secondary-slate/30 bg-white px-3 py-1.5 text-xs hover:bg-qic-secondary-sand-20"
              >
                Select files
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-2 border-t border-qic-secondary-slate/15 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-qic-secondary-slate/20 bg-white px-4 py-2 text-sm text-qic-secondary-slate hover:bg-qic-secondary-sand-20"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="request-form"
            className="rounded-lg bg-qic-corp-red px-4 py-2 text-sm font-medium text-white hover:bg-qic-corp-red/80"
          >
            {mode === "new" ? "Create Request" : "Create Rolled Forward"}
          </button>
        </div>
      </div>
    </div>
  );
}
