import { useEffect, useState } from "react";

export type ApiState =
  | { kind: "checking"; slow: boolean }
  | { kind: "up"; ms: number }
  | { kind: "down" };

const GIVE_UP_MS = 60_000;
const RECHECK_MS = 30_000;
const SLOW_AFTER_MS = 3_000;

/**
 * Pings the API's /health and keeps re-checking. A free-tier server can take
 * about 30 seconds to wake, so after a few seconds the state says "slow"
 * instead of leaving a spinner that looks broken.
 */
export function useApiHealth(apiUrl: string): ApiState {
  const [state, setState] = useState<ApiState>({ kind: "checking", slow: false });

  useEffect(() => {
    let cancelled = false;
    let next: number | undefined;

    async function check() {
      const started = performance.now();
      const controller = new AbortController();
      const giveUp = window.setTimeout(() => controller.abort(), GIVE_UP_MS);
      try {
        const res = await fetch(`${apiUrl}/health`, { signal: controller.signal, cache: "no-store" });
        if (!cancelled) {
          setState(res.ok ? { kind: "up", ms: Math.round(performance.now() - started) } : { kind: "down" });
        }
      } catch {
        if (!cancelled) setState({ kind: "down" });
      } finally {
        window.clearTimeout(giveUp);
        if (!cancelled) next = window.setTimeout(check, RECHECK_MS);
      }
    }

    const slow = window.setTimeout(
      () => setState((s) => (s.kind === "checking" ? { kind: "checking", slow: true } : s)),
      SLOW_AFTER_MS,
    );
    void check();

    return () => {
      cancelled = true;
      window.clearTimeout(next);
      window.clearTimeout(slow);
    };
  }, [apiUrl]);

  return state;
}
