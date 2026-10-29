// A deployment must opt into production explicitly. This prevents preview and
// misconfigured deployments from presenting simulation data as live services.
const configuredMode = String(import.meta.env.VITE_FARMLINK_MODE || "demo").toLowerCase();

export const isDemoMode = configuredMode !== "production";
export const platformModeLabel = isDemoMode ? "Demonstration" : "Production";

export const DEMO_NOTICE =
  "Demonstration only — market, warehouse, AI, and finance information is not a live transaction, certificate, offer, or guarantee.";
