type Props = { label: "Open" | "In Progress" | "Closed" };
export default function Badge({ label }: Props) {
  const map: Record<Props["label"], string> = {
    Open:        "bg-qic-primary-teal-20 text-qic-secondary-forest ring-1 ring-qic-primary-teal-60/30",
    "In Progress":"bg-qic-primary-blue-20 text-qic-secondary-slate ring-1 ring-qic-primary-blue-60/30",
    Closed:      "bg-qic-secondary-slate-20 text-qic-secondary-slate ring-1 ring-qic-secondary-slate-60/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[label]}`}>
      {label}
    </span>
  );
}
