import { stats } from "../content";
import { Reveal } from "./Reveal";

const items = [
  { value: stats.apps, label: "apps on one backend" },
  { value: stats.endpoints, label: "documented API endpoints" },
  { value: stats.tests, label: "backend tests" },
  { value: stats.ciChecks, label: "checks on every pull request" },
] as const;

/** The receipts: four numbers a reader can check in the repo. */
export function Stats() {
  return (
    <section aria-label="By the numbers" className="border-y border-line bg-panel/60">
      <dl className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-9 px-5 py-11 sm:px-8 md:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 80} className={`px-2 md:px-8 ${i > 0 ? "md:border-l md:border-line" : ""}`}>
            <div className="flex flex-col-reverse">
              <dt className="mt-2 max-w-[13rem] text-sm leading-snug text-muted">{item.label}</dt>
              <dd className="font-display text-5xl font-bold leading-none text-gold sm:text-6xl">{item.value}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
