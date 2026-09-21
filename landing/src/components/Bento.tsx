import type { ReactNode } from "react";
import { config } from "../config";
import { ciChecks, requestLog, stats } from "../content";
import { CheckIcon } from "./icons";
import { ArrowUpRight } from "./icons";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

function Tile({ className = "", delay = 0, children }: { className?: string; delay?: number; children: ReactNode }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="card flex h-full flex-col p-7">{children}</div>
    </Reveal>
  );
}

const statusTone = (status: string) => (status.startsWith("2") ? "text-neon" : "text-red");

export function Bento() {
  return (
    <section id="hood" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHead index="02" kicker="Under the hood" title="More than screens.">
            The apps are the visible part. This is what holds them up.
          </SectionHead>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Tile className="lg:col-span-7">
            <p className="label !text-gold">The API</p>
            <h3 className="mt-2 text-3xl leading-tight">A real backend, not a mock.</h3>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              Express 5 on Node 20 with Sequelize and PostgreSQL. Versioned migrations, JWTs that expire, every query scoped to its owner,
              and prices and durations decided on the server. All {stats.endpoints} endpoints are documented in OpenAPI.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-black/40 p-4 font-mono text-[0.8rem] leading-7" aria-label="Example requests">
              {requestLog.map(([method, path, status]) => (
                <span key={path} className="flex gap-4">
                  <span className="w-12 text-muted">{method}</span>
                  <span className="flex-1 text-text">{path}</span>
                  <span className={statusTone(status)}>{status}</span>
                </span>
              ))}
            </pre>
            <a
              href={`${config.apiUrl}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 self-start font-display text-sm font-bold tracking-wide text-neon hover:underline"
            >
              Browse the API docs <ArrowUpRight width={15} height={15} />
            </a>
          </Tile>

          <Tile className="lg:col-span-5" delay={90}>
            <p className="label !text-gold">Tests</p>
            <p className="mt-3 font-display text-[7rem] font-bold leading-none tracking-tight text-gold tabular-nums">{stats.tests}</p>
            <p className="mt-1 font-display text-xl font-bold">backend tests</p>
            <p className="mt-3 leading-relaxed text-muted">
              They run against a real PostgreSQL in a throwaway schema, so the migrations get exercised on an empty database every time.
            </p>
          </Tile>

          <Tile className="lg:col-span-5">
            <p className="label !text-gold">Continuous integration</p>
            <h3 className="mt-2 text-2xl leading-tight">Every pull request is checked.</h3>
            <ul className="mt-5 grid gap-2.5">
              {ciChecks.map((check) => (
                <li key={check} className="flex items-center gap-3 text-sm text-muted">
                  <CheckIcon width={16} height={16} className="shrink-0 text-neon" />
                  {check}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile className="lg:col-span-7" delay={90}>
            <p className="label !text-gold">Setup</p>
            <h3 className="mt-2 text-3xl leading-tight">One command.</h3>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              Clone the repo, run <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-text">make up</code>, and the
              database, the API, the three apps and this page start with sample data already loaded.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-black/40 p-4 font-mono text-[0.8rem] leading-7">
              <span className="text-muted">$ </span>
              <span className="text-neon">make up</span>
              {"\n"}
              {[
                ["warriors-db-1", "Healthy"],
                ["warriors-backend-1", "Healthy"],
                ["warriors-admin-web-1", "Healthy"],
                ["warriors-admin-mobile-web-1", "Healthy"],
                ["warriors-member-mobile-web-1", "Healthy"],
                ["warriors-landing-1", "Healthy"],
              ].map(([name, state]) => (
                <span key={name} className="flex gap-3">
                  <span className="text-muted">Container</span>
                  <span className="flex-1 text-text">{name}</span>
                  <span className="text-neon">{state}</span>
                </span>
              ))}
            </pre>
          </Tile>

          <Tile className="lg:col-span-4">
            <p className="label !text-gold">Offline first</p>
            <h3 className="mt-2 text-2xl leading-tight">Built for bad signal.</h3>
            <p className="mt-3 leading-relaxed text-muted">
              The apps keep what they loaded, and queue check-ins, payments and new members until the connection is back.
            </p>
          </Tile>

          <Tile className="lg:col-span-4" delay={90}>
            <p className="label !text-gold">Demo mode</p>
            <h3 className="mt-2 text-2xl leading-tight">Safe to poke.</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Sample data seeds itself, the demo logins are locked, and a protected endpoint puts everything back the way it was.
            </p>
          </Tile>

          <Tile className="lg:col-span-4" delay={180}>
            <p className="label !text-gold">Security</p>
            <h3 className="mt-2 text-2xl leading-tight">The boring stuff, done.</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Rate limits, security headers, a CORS allowlist, hashed passwords that never leave the API, and secret scanning on every push.
            </p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
