// app/rg97/[req]/page.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import Badge from "../../components/Badge";
import { mockRequests, RequestItem } from "../../lib/data";
import { ArrowLeft, CheckCircle2, Paperclip } from "lucide-react";
import clsx from "clsx";

/* ------------------------------ Helpers ------------------------------ */
function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function fmtMMMYY(iso?: string): string {
  if (!iso) return "—";
  const dt = parseISODateLocal(iso);
  const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${shortMonths[dt.getMonth()]}-${String(dt.getFullYear()).slice(-2)}`;
}
function fmtDMonY(iso?: string): string {
  if (!iso) return "—";
  const dt = parseISODateLocal(iso);
  const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${dt.getDate()} ${shortMonths[dt.getMonth()]} ${dt.getFullYear()}`;
}
function joinPeriod(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return "—";
  return `${fmtDMonY(startISO)} – ${fmtDMonY(endISO)}`;
}

/* ------------------------------ Types ------------------------------ */
type Attachment = { name: string; size?: string };

type ExtendedRequestItem = RequestItem & {
  products?: string[];
  teams?: string[];
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
  attachments?: Attachment[];
};

type ActionItem = {
  id: string;
  type: "action";
  title: string;
  assignedTeam: string;
  notes: string;
  attachments: Attachment[];
  completedDate?: string;
  completedBy?: string;
  status: "pending" | "complete";
  dependsOn?: string[];
};

type DraftStatus = "pending" | "approved" | "rejected";

type ReviewDecision = {
  status: "approved" | "rejected";
  notes?: string;
  reply?: string;
  at: string; // ISO
  by: string; // user
};

type ReviewDraft = {
  status: DraftStatus;
  notes: string;
  reply: string;
};

type ReviewTeamThread = {
  team: string;
  decisions: ReviewDecision[]; // history
  draft: ReviewDraft;
};

type ReviewItem = {
  id: string;
  type: "review";
  title: string;
  teams: ReviewTeamThread[];
  dependsOn?: string[];
};

type ChecklistItem = ActionItem | ReviewItem;

type AuditEvent =
  | {
      id: string;
      at: string;
      by: string;
      kind: "action_completed";
      actionId: string;
      title: string;
    }
  | {
      id: string;
      at: string;
      by: string;
      kind: "attachment_added";
      actionId: string;
      files: string[];
    }
  | {
      id: string;
      at: string;
      by: string;
      kind: "review_decision";
      reviewId: string;
      team: string;
      status: "approved" | "rejected";
      notes?: string;
      reply?: string;
    };

const CURRENT_USER = "user1";

/* Strongly-typed draft merge to avoid status widening to string */
function mergeDraft(prev: ReviewDraft, patch: Partial<ReviewDraft>): ReviewDraft {
  return {
    status: patch.status ?? prev.status,
    notes: patch.notes ?? prev.notes,
    reply: patch.reply ?? prev.reply,
  };
}

/* ------------------------------ Page ------------------------------ */
export default function RG97RequestDetailPage() {
  const router = useRouter();
  const params = useParams<{ req: string }>();
  const reqId = params?.req;

  const record: ExtendedRequestItem | undefined = useMemo(
    () => mockRequests.find((r) => r.id === reqId),
    [reqId]
  );

  /* ------------------------- Audit log (in-memory) ------------------------ */
  const [audit, setAudit] = useState<AuditEvent[]>([
    {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      by: "system",
      kind: "action_completed",
      actionId: "1",
      title: "Request Logged",
    },
  ]);
  const pushAudit = (evt: AuditEvent) => setAudit((cur) => [evt, ...cur]);

  /* ----------------------- Checklist initialisation ----------------------- */
  const reviewTeamsSeed: string[] = record?.teams?.length
    ? (record.teams as string[])
    : ["Fund Finance RE", "Fund Finance SI/LMG", "Fund Finance Infra"];

  const [items, setItems] = useState<ChecklistItem[]>(() => [
    {
      id: "1",
      type: "action",
      title: "Request Logged",
      assignedTeam: "Client Reporting",
      notes: "Auto-completed when request is lodged in the system.",
      attachments: [],
      status: "complete",
      completedBy: "system",
      completedDate: new Date().toISOString(),
    },
    {
      id: "2",
      type: "action",
      title: "Client communication",
      assignedTeam: "Client Reporting",
      notes: "",
      attachments: [],
      status: "pending",
      dependsOn: ["1"],
    },
    {
      id: "3",
      type: "action",
      title: "RG97 File Generation",
      assignedTeam: "Fee Billing",
      notes: "",
      attachments: [],
      status: "pending",
      dependsOn: ["2"],
    },
    {
      id: "4",
      type: "review",
      title: "RG97 File Review",
      teams: reviewTeamsSeed.map<ReviewTeamThread>((t) => ({
        team: t,
        decisions: [],
        draft: { status: "pending", notes: "", reply: "" },
      })),
      dependsOn: ["3"],
    },
    {
      id: "5",
      type: "action",
      title: "RG97 File Sent to Client",
      assignedTeam: "Client Reporting",
      notes: "",
      attachments: [],
      status: "pending",
      dependsOn: ["4"],
    },
  ]);

  /* ----------------------- Not Found (render branch) ---------------------- */
  if (!record) {
    return (
      <Shell>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-heading text-qic-secondary-slate">Request not found</h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md border border-qic-secondary-slate/25 bg-white px-3 py-1.5 text-sm text-qic-secondary-slate hover:bg-qic-secondary-sand-20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="rounded-xl border bg-white p-6 text-qic-secondary-slate shadow-sm">
          <p className="text-sm text-qic-secondary-slate/70">
            The request you’re looking for doesn’t exist or was removed.
          </p>
        </div>
      </Shell>
    );
  }

  /* ----------------------- Checklist utilities ----------------------- */
  const teamEffectiveStatus = (thr: ReviewTeamThread): DraftStatus => {
    const last = thr.decisions.at(-1);
    return last ? last.status : "pending";
  };

  const isComplete = (item: ChecklistItem): boolean => {
    if (item.type === "action") return item.status === "complete";
    return item.teams.every((t) => teamEffectiveStatus(t) === "approved");
  };

  const canInteract = (item: ChecklistItem): boolean => {
    if (!item.dependsOn || item.dependsOn.length === 0) return true;
    return item.dependsOn.every((depId) => {
      const dep = items.find((i) => i.id === depId);
      return dep ? isComplete(dep) : false;
    });
  };

  const setActionField = <K extends keyof ActionItem>(id: string, key: K, val: ActionItem[K]) => {
    setItems((cur) =>
      cur.map((i) => (i.id === id && i.type === "action" ? { ...i, [key]: val } : i))
    );
  };

  const markActionComplete = (id: string) => {
    setItems((cur) =>
      cur.map((i) =>
        i.id === id && i.type === "action"
          ? { ...i, status: "complete", completedDate: new Date().toISOString(), completedBy: CURRENT_USER }
          : i
      )
    );
    const action = items.find((i): i is ActionItem => i.id === id && i.type === "action");
    pushAudit({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      by: CURRENT_USER,
      kind: "action_completed",
      actionId: id,
      title: action ? action.title : "Action",
    });
  };

  const addActionAttachments = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);

    setItems((cur) =>
      cur.map((i) => {
        if (i.id !== id || i.type !== "action") return i;
        const extras: Attachment[] = Array.from(files).map((f) => ({
          name: f.name,
          size: f.size ? `${Math.ceil(f.size / 1024)} KB` : undefined,
        }));
        return { ...i, attachments: [...i.attachments, ...extras] };
      })
    );

    pushAudit({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      by: CURRENT_USER,
      kind: "attachment_added",
      actionId: id,
      files: names,
    });
  };

  const setReviewDraft = (
    itemId: string,
    team: string,
    patch: Partial<ReviewDraft>
  ) => {
    setItems((cur) =>
      cur.map((i) => {
        if (i.id !== itemId || i.type !== "review") return i;
        const teams: ReviewTeamThread[] = i.teams.map((t) =>
          t.team === team ? { ...t, draft: mergeDraft(t.draft, patch) } : t
        );
        return { ...i, teams };
      })
    );
  };

  const confirmOneTeamReviewUpdate = (itemId: string, team: string) => {
    setItems((cur) =>
      cur.map((i) => {
        if (i.id !== itemId || i.type !== "review") return i;

        const teams: ReviewTeamThread[] = i.teams.map((t) => {
          if (t.team !== team) return t;

          const { status, notes, reply } = t.draft;
          if (status === "pending") return t;

          const decision: ReviewDecision = {
            status: status === "approved" ? "approved" : "rejected",
            notes: notes?.trim() ? notes : undefined,
            reply: reply?.trim() ? reply : undefined,
            at: new Date().toISOString(),
            by: CURRENT_USER,
          };

          pushAudit({
            id: crypto.randomUUID(),
            at: decision.at,
            by: CURRENT_USER,
            kind: "review_decision",
            reviewId: itemId,
            team: t.team,
            status: decision.status,
            notes: decision.notes,
            reply: decision.reply,
          });

          const resetDraft: ReviewDraft = { status: "pending", notes: "", reply: "" };

          return {
            ...t,
            decisions: [...t.decisions, decision],
            draft: resetDraft,
          };
        });

        return { ...i, teams };
      })
    );
  };

  /* --------------------------------- UI --------------------------------- */
  return (
    <Shell>
      {/* Header: Back on the right, no top status badge */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-heading text-qic-secondary-slate">
          {record.requestName}
        </h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md border border-qic-secondary-slate/25 bg-white px-3 py-1.5 text-sm text-qic-secondary-slate hover:bg-qic-secondary-sand-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-qic-secondary-slate">Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Client" value={record.client} />
              <Field label="Quarter End" value={fmtMMMYY(record.quarterEnd)} />
              <Field label="Request Date" value={record.requestDate ? fmtDMonY(record.requestDate) : "—"} />
              <Field label="Due Date" value={record.dueDate ? fmtDMonY(record.dueDate) : "—"} />
              <Field label="Period" value={joinPeriod(record.periodStart, record.periodEnd)} colSpan />
            </div>
          </div>

          {/* Scope */}
          {(record.products?.length || record.teams?.length) ? (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-heading text-qic-secondary-slate">Scope</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {record.products?.length ? <FieldList label="Products" items={record.products} /> : <div />}
                {record.teams?.length ? <FieldList label="Responsible Teams" items={record.teams} /> : <div />}
              </div>
            </div>
          ) : null}

          {/* Notes */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-qic-secondary-slate">Notes</h2>
            <p className={clsx("text-sm", !record.notes && "text-qic-secondary-slate/60")}>
              {record.notes || "—"}
            </p>
          </div>

          {/* Attachments */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-qic-secondary-slate">Attachments</h2>
            {record.attachments && record.attachments.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-qic-secondary-slate">
                {record.attachments.map((a) => (
                  <li key={a.name}>
                    {a.name}
                    {a.size ? <span className="text-qic-secondary-slate/60"> ({a.size})</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-qic-secondary-slate/60">No attachments</p>
            )}
          </div>

          {/* Audit Log */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-qic-secondary-slate">Audit Log</h2>
            {audit.length === 0 ? (
              <p className="text-sm text-qic-secondary-slate/60">No events yet</p>
            ) : (
              <ul className="space-y-2">
                {audit.map((evt) => (
                  <li
                    key={evt.id}
                    className="rounded-md border border-qic-secondary-slate/20 bg-white p-3 text-sm text-qic-secondary-slate"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        {evt.kind === "action_completed" && (
                          <>Action completed: <span className="text-qic-corp-red">{evt.title}</span></>
                        )}
                        {evt.kind === "attachment_added" && (<>Attachments added to action {evt.actionId}</>)}
                        {evt.kind === "review_decision" && (
                          <>Review — <span className="text-qic-corp-red">{evt.team}</span>: {evt.status === "approved" ? "Approved" : "Rejected"}</>
                        )}
                      </div>
                      <div className="text-[11px] text-qic-secondary-slate/70">
                        {fmtDMonY(evt.at)} • by {evt.by}
                      </div>
                    </div>
                    {"files" in evt && evt.files?.length ? (
                      <div className="mt-1 text-[12px] text-qic-secondary-slate/80">Files: {evt.files.join(", ")}</div>
                    ) : null}
                    {"notes" in evt && evt.notes ? (
                      <div className="mt-1 text-[12px] text-qic-secondary-slate/80">Notes: {evt.notes}</div>
                    ) : null}
                    {"reply" in evt && evt.reply ? (
                      <div className="mt-1 text-[12px] text-qic-secondary-slate/80">Reply: {evt.reply}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT: Checklist */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-qic-secondary-slate">Checklist</h2>

            <div className="space-y-4">
              {items.map((item) => {
                const active = canInteract(item);
                const completed = isComplete(item);
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "rounded-lg border p-4",
                      completed
                        ? "border-green-400 bg-green-50"
                        : active
                        ? "border-qic-corp-red/40 bg-white"
                        : "border-qic-secondary-slate/20 bg-qic-secondary-sand-20/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-qic-secondary-slate">{item.title}</h3>
                        <p className="text-xs text-qic-secondary-slate/70">
                          {item.type === "action" ? `Assigned: ${(item as ActionItem).assignedTeam}` : "Review item"}
                        </p>
                      </div>
                      {completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>

                    {/* ACTION ITEM BODY */}
                    {item.type === "action" && (
                      <ActionBody
                        item={item}
                        active={active}
                        completed={completed}
                        onChangeNotes={(val) => setActionField(item.id, "notes", val)}
                        onAddFiles={(files) => addActionAttachments(item.id, files)}
                        onComplete={() => markActionComplete(item.id)}
                      />
                    )}

                    {/* REVIEW ITEM BODY */}
                    {item.type === "review" && (
                      <ReviewBody
                        item={item}
                        active={active}
                        onDraftChange={(team, patch) => setReviewDraft(item.id, team, patch)}
                        onConfirmTeam={(team) => confirmOneTeamReviewUpdate(item.id, team)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------- Action Body ---------------------------- */
function ActionBody({
  item,
  active,
  completed,
  onChangeNotes,
  onAddFiles,
  onComplete,
}: {
  item: ActionItem;
  active: boolean;
  completed: boolean;
  onChangeNotes: (v: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onComplete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="mt-3 space-y-3">
      <textarea
        placeholder="Notes (optional)…"
        className="w-full rounded-md border border-qic-secondary-slate/30 bg-white px-2 py-2 text-sm"
        value={item.notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        disabled={!active || completed}
      />

      <div className="flex items-center justify-between text-xs">
        <div className="text-qic-secondary-slate/70">
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" /> Attachments: {item.attachments.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onAddFiles(e.target.files)}
            disabled={!active || completed}
          />
          <button
            type="button"
            className="rounded-md border border-qic-secondary-slate/30 bg-white px-2 py-1 text-xs hover:bg-qic-secondary-sand-20 disabled:opacity-50"
            disabled={!active || completed}
            onClick={() => fileRef.current?.click()}
          >
            Add Attachment
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={!active || completed}
        className={clsx(
          "mt-1 block w-full rounded-md px-3 py-2 text-sm font-medium text-white",
          !active || completed
            ? "bg-qic-secondary-slate/40"
            : "bg-qic-corp-red hover:bg-qic-corp-red/80"
        )}
      >
        {completed ? "Completed" : "Mark Complete"}
      </button>

      {item.completedDate && (
        <div className="text-[11px] text-qic-secondary-slate/70">
          Completed {fmtDMonY(item.completedDate)} by {item.completedBy ?? "—"}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Review Body ---------------------------- */
function ReviewBody({
  item,
  active,
  onDraftChange,
  onConfirmTeam,
}: {
  item: ReviewItem;
  active: boolean;
  onDraftChange: (team: string, patch: Partial<ReviewDraft>) => void;
  onConfirmTeam: (team: string) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      {item.teams.map((t) => {
        const last = t.decisions.at(-1);
        const lastRejected = last?.status === "rejected";
        const disableInputs = !active || last?.status === "approved";

        return (
          <div key={t.team} className="rounded-md border border-qic-secondary-slate/20 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-qic-secondary-slate">{t.team}</div>
              <span
                className={clsx(
                  "rounded px-2 py-0.5 text-[11px]",
                  !last
                    ? "bg-qic-secondary-slate/10 text-qic-secondary-slate/80"
                    : last.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {!last ? "Pending" : last.status === "approved" ? "Approved" : "Rejected"}
              </span>
            </div>

            {/* History */}
            {t.decisions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {t.decisions.map((d, idx) => (
                  <li key={idx} className="text-xs text-qic-secondary-slate">
                    <span className="font-medium">{d.status === "approved" ? "Approved" : "Rejected"}</span>
                    {" • "}
                    <span className="text-qic-secondary-slate/70">{fmtDMonY(d.at)}</span>
                    {" • "}
                    <span className="text-qic-secondary-slate/70">by {d.by}</span>
                    {d.notes && <span className="text-qic-secondary-slate/80"> — {d.notes}</span>}
                    {d.reply && (
                      <div className="ml-4 text-[11px] text-qic-secondary-slate/80">
                        <span className="font-medium">Reply:</span> {d.reply}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Draft inputs */}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-qic-secondary-slate/80">Decision</label>
                <select
                  value={t.draft.status}
                  onChange={(e) => onDraftChange(t.team, { status: e.target.value as DraftStatus })}
                  disabled={disableInputs}
                  className="w-full rounded-md border border-qic-secondary-slate/30 bg-white px-2 py-1 text-sm text-qic-secondary-slate disabled:bg-qic-secondary-sand-20/60"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-qic-secondary-slate/80">Notes</label>
                <textarea
                  placeholder="Reviewer notes…"
                  value={t.draft.notes}
                  onChange={(e) => onDraftChange(t.team, { notes: e.target.value })}
                  disabled={disableInputs}
                  className="h-[38px] w-full rounded-md border border-qic-secondary-slate/30 bg-white px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Reply field if rejected last time */}
            {lastRejected && (
              <div className="mt-2">
                <label className="mb-1 block text-[11px] text-qic-secondary-slate/80">Reply to rejection</label>
                <textarea
                  placeholder="Provide clarification or updated info…"
                  value={t.draft.reply}
                  onChange={(e) => onDraftChange(t.team, { reply: e.target.value })}
                  disabled={!active}
                  className="w-full rounded-md border border-qic-secondary-slate/30 bg-white px-2 py-1 text-sm"
                />
                <p className="mt-1 text-[11px] text-qic-secondary-slate/70">
                  Add a reply and choose a new decision above (Approve/Reject) to re-submit.
                </p>
              </div>
            )}

            {/* Confirm button per team */}
            <button
              type="button"
              onClick={() => onConfirmTeam(t.team)}
              disabled={!active || t.draft.status === "pending"}
              className={clsx(
                "mt-3 block w-full rounded-md px-3 py-2 text-sm font-medium text-white",
                !active || t.draft.status === "pending"
                  ? "bg-qic-secondary-slate/40"
                  : "bg-qic-corp-red hover:bg-qic-corp-red/80"
              )}
            >
              Confirm Update for {t.team}
            </button>
          </div>
        );
      })}

      {!active && (
        <div className="text-[11px] text-qic-secondary-slate/70">
          This step unlocks after all prerequisite steps are completed.
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Small UI bits ---------------------------- */
function Field({
  label,
  value,
  colSpan = false,
}: {
  label: string;
  value: string;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "sm:col-span-2" : ""}>
      <div className="text-xs font-medium text-qic-secondary-slate/80">{label}</div>
      <div className="mt-0.5 text-sm text-qic-secondary-slate">{value}</div>
    </div>
  );
}

function FieldList({ label, items = [] as string[] }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-medium text-qic-secondary-slate/80">{label}</div>
      {items.length ? (
        <ul className="mt-1 list-disc pl-5 text-sm text-qic-secondary-slate">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 text-sm text-qic-secondary-slate/60">—</div>
      )}
    </div>
  );
}
