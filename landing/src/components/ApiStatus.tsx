import { config } from "../config";
import { useApiHealth } from "../hooks/useApiHealth";

/** A live light for the API, so a cold start reads as "waking up", not "broken". */
export function ApiStatus({ className = "" }: { className?: string }) {
  const state = useApiHealth(config.apiUrl);

  const view =
    state.kind === "up"
      ? { dot: "bg-neon text-neon animate-pulse-ring", text: `API awake · ${state.ms} ms` }
      : state.kind === "checking"
        ? state.slow
          ? { dot: "bg-gold text-gold animate-pulse", text: "Waking the server… up to 30 s on the free tier" }
          : { dot: "bg-gold text-gold", text: "Checking the API…" }
        : { dot: "bg-red text-red", text: "API not answering. It may be asleep; retrying" };

  return (
    <p
      role="status"
      className={`inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/80 px-3.5 py-1.5 text-sm text-muted backdrop-blur ${className}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${view.dot}`} />
      {view.text}
    </p>
  );
}
