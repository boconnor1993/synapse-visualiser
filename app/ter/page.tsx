import Shell from "../components/Shell";
import { mockRequests } from "../lib/data";

export default function TERPage() {
  const items = mockRequests.filter(r => r.type === "TER");
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">TER</h1>
      <div className="mt-4 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left">Request</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Quarter End</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.requestName}</td>
                <td className="px-4 py-2">{r.client}</td>
                <td className="px-4 py-2">{r.quarterEnd}</td>
                <td className="px-4 py-2">{r.dueDate}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
