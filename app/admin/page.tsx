import Shell from "../components/Shell";

export default function AdminPage() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder for approval groups, user management, and configuration.
      </p>
      <ul className="mt-4 list-disc pl-6 text-sm text-slate-700">
        <li>Create and assign approval groups</li>
        <li>Manage modules (RG97, TER, MySuper)</li>
        <li>Environment & integrations (Power Platform, SharePoint, etc.)</li>
      </ul>
    </Shell>
  );
}
