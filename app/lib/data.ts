// app/lib/data.ts

export type RequestItem = {
  id: string;
  type: "RG97" | "TER" | "MySuper";
  requestName: string;
  client: string;
  quarterEnd: string; // ISO date string
  requestDate: string; // ISO date string
  periodStart: string; // ISO date string
  periodEnd: string;   // ISO date string
  dueDate: string;     // ISO date string
  status: "Open" | "Closed" | "In Progress";
  products: string[];
  teams: string[];
  notes?: string;
};

export const mockRequests: RequestItem[] = [
  {
    id: "rg97-001",
    type: "RG97",
    requestName: "Q4 FY25 RG97 Pack",
    client: "Client 1",
    quarterEnd: "2025-06-30",
    requestDate: "2025-06-15",
    periodStart: "2025-04-01",
    periodEnd: "2025-06-30",
    dueDate: "2025-07-14",
    status: "Open",
    products: ["Product A", "Product B"],
    teams: ["Fund Finance GPC", "LMG Trading Team", "Fee Billing"],
    notes: "Follow-up required for Product B reconciliation.",
  },
  {
    id: "rg97-002",
    type: "RG97",
    requestName: "Q3 FY25 RG97 Update",
    client: "Client 2",
    quarterEnd: "2025-03-31",
    requestDate: "2025-03-15",
    periodStart: "2025-01-01",
    periodEnd: "2025-03-31",
    dueDate: "2025-04-10",
    status: "Closed",
    products: ["Product C", "Product D"],
    teams: ["Fund Finance Infra", "Fee Billing"],
    notes: "All submissions received on time.",
  },
  {
    id: "rg97-003",
    type: "RG97",
    requestName: "Q1 FY26 RG97 Preliminary",
    client: "Client 3",
    quarterEnd: "2025-09-30",
    requestDate: "2025-09-10",
    periodStart: "2025-07-01",
    periodEnd: "2025-09-30",
    dueDate: "2025-10-14",
    status: "In Progress",
    products: ["Product E", "Product F"],
    teams: ["Fund Finance SI/LMG", "LMG Trading Team", "Fee Billing"],
    notes: "Awaiting final sign-off for Product E data.",
  },
  {
    id: "ter-004",
    type: "TER",
    requestName: "FY25 TER Refresh",
    client: "Client 2",
    quarterEnd: "2025-06-30",
    requestDate: "2025-07-05",
    periodStart: "2025-01-01",
    periodEnd: "2025-06-30",
    dueDate: "2025-08-01",
    status: "In Progress",
    products: ["Product A", "Product G"],
    teams: ["Fund Finance RE", "Fund Finance GPC", "Fee Billing"],
  },
  {
    id: "mysuper-005",
    type: "MySuper",
    requestName: "MySuper FY25 Annual Report",
    client: "Client 3",
    quarterEnd: "2025-06-30",
    requestDate: "2025-07-01",
    periodStart: "2024-07-01",
    periodEnd: "2025-06-30",
    dueDate: "2025-09-10",
    status: "Closed",
    products: ["Product F"],
    teams: ["Fund Finance SI/LMG", "Fee Billing"],
  },
  {
    id: "rg97-006",
    type: "RG97",
    requestName: "Q2 FY25 RG97 Roll Forward",
    client: "Client 1",
    quarterEnd: "2024-12-31",
    requestDate: "2025-01-10",
    periodStart: "2024-10-01",
    periodEnd: "2024-12-31",
    dueDate: "2025-01-24",
    status: "Closed",
    products: ["Product B", "Product G"],
    teams: ["Fund Finance RE", "Fund Finance GPC", "Fee Billing"],
  },
  {
    id: "ter-007",
    type: "TER",
    requestName: "Q4 FY25 TER Quarterly",
    client: "Client 1",
    quarterEnd: "2025-06-30",
    requestDate: "2025-06-20",
    periodStart: "2025-04-01",
    periodEnd: "2025-06-30",
    dueDate: "2025-07-12",
    status: "Open",
    products: ["Product A"],
    teams: ["Fund Finance GPC", "Fee Billing"],
  },
  {
    id: "mysuper-008",
    type: "MySuper",
    requestName: "MySuper FY26 Setup",
    client: "Client 4",
    quarterEnd: "2025-09-30",
    requestDate: "2025-09-01",
    periodStart: "2025-07-01",
    periodEnd: "2025-09-30",
    dueDate: "2025-10-10",
    status: "Open",
    products: ["Product F", "Product C"],
    teams: ["Fund Finance RE", "Fund Finance SI/LMG", "Fee Billing"],
  },
];

// ----------------------------------------------------------------------
// GENERIC CLIENT / PRODUCT / TEAM DEFINITIONS
// ----------------------------------------------------------------------

export const clients = ["Client 1", "Client 2", "Client 3", "Client 4", "Client 5"];

export const clientProducts: Record<string, string[]> = {
  "Client 1": ["Product A", "Product B", "Product C"],
  "Client 2": ["Product D", "Product E"],
  "Client 3": ["Product E", "Product F"],
  "Client 4": ["Product F", "Product G"],
  "Client 5": ["Product A", "Product D", "Product G"],
};

export const productTeams: Record<string, string[]> = {
  "Product A": ["Fund Finance GPC"],
  "Product B": ["LMG Trading Team"],
  "Product C": ["Fund Finance Infra"],
  "Product D": ["Fund Finance RE"],
  "Product E": ["Fund Finance SI/LMG"],
  "Product F": ["Fund Finance Infra", "Fund Finance SI/LMG"],
  "Product G": ["Fund Finance RE"],
};

export const ALWAYS_TEAMS = ["Fee Billing"];
