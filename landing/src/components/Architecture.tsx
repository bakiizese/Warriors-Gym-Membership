import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

const clients = [
  { y: 64, title: "Admin web", sub: "React 19 · Vite · Tailwind", port: ":8080" },
  { y: 176, title: "Admin mobile", sub: "Expo · React Native", port: ":8081" },
  { y: 288, title: "Member mobile", sub: "Expo · React Native", port: ":8082" },
] as const;

/** Clients on the left, the API in the middle, the database on the right. */
export function Architecture() {
  return (
    <section id="architecture" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHead index="03" kicker="Architecture" title="How the pieces fit.">
            Three clients talk to one API over HTTPS and JSON. The API is the only thing that touches the database, so every rule lives in
            one place.
          </SectionHead>
        </Reveal>

        <Reveal className="mt-14">
          <div className="card blueprint overflow-x-auto p-4 sm:p-8">
            <svg
              viewBox="0 0 960 520"
              role="img"
              aria-label="Diagram: the admin web, admin mobile and member mobile apps call one Express API, which reads and writes a PostgreSQL database. GitHub Actions checks every change."
              className="mx-auto min-w-[760px]"
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10z" fill="#9aa1b5" />
                </marker>
              </defs>

              {/* Everything runs from one compose file. */}
              <rect x="16" y="16" width="928" height="408" rx="26" fill="#08090c" fillOpacity="0.55" stroke="#232733" strokeWidth="1.5" strokeDasharray="6 8" />
              <text x="40" y="46" className="fill-[#9aa1b5] font-display" fontSize="13" letterSpacing="2.4" fontWeight="700">
                DOCKER COMPOSE · MAKE UP
              </text>

              {clients.map((c) => (
                <g key={c.title}>
                  <rect x="48" y={c.y + 10} width="250" height="84" rx="16" fill="#0e1017" stroke="#232733" />
                  <text x="72" y={c.y + 46} className="fill-[#f2f3f7] font-display" fontSize="22" fontWeight="700">
                    {c.title}
                  </text>
                  <text x="72" y={c.y + 70} className="fill-[#9aa1b5]" fontSize="13">
                    {c.sub}
                  </text>
                  <text x="282" y={c.y + 84} textAnchor="end" className="fill-[#f0b429] font-mono" fontSize="12">
                    {c.port}
                  </text>
                </g>
              ))}

              {/* Requests flowing right. */}
              {[
                [116, 160],
                [228, 220],
                [340, 280],
              ].map(([from, to]) => (
                <path
                  key={from}
                  d={`M298 ${from} C 366 ${from}, 366 ${to}, 430 ${to}`}
                  fill="none"
                  stroke="#9aa1b5"
                  strokeWidth="1.6"
                  markerEnd="url(#arrow)"
                  className="flow"
                />
              ))}
              <text x="364" y="198" textAnchor="middle" className="fill-[#9aa1b5] font-display" fontSize="11" letterSpacing="1.6" fontWeight="700">
                HTTPS · JSON
              </text>

              <rect x="430" y="116" width="230" height="208" rx="20" fill="#0e1017" stroke="#d9252b" strokeWidth="2" />
              <text x="456" y="160" className="fill-[#f2f3f7] font-display" fontSize="26" fontWeight="700">
                Express API
              </text>
              {["JWT auth and roles", "Rate limits and helmet", "Sequelize migrations", "OpenAPI at /docs"].map((line, i) => (
                <text key={line} x="456" y={198 + i * 26} className="fill-[#9aa1b5]" fontSize="14">
                  {line}
                </text>
              ))}
              <text x="644" y="308" textAnchor="end" className="fill-[#f0b429] font-mono" fontSize="12">
                :5000
              </text>

              <path d="M660 220 L 746 220" fill="none" stroke="#9aa1b5" strokeWidth="1.6" markerEnd="url(#arrow)" className="flow" />
              <text x="703" y="208" textAnchor="middle" className="fill-[#9aa1b5] font-display" fontSize="11" letterSpacing="1.6" fontWeight="700">
                SQL
              </text>

              <rect x="748" y="150" width="180" height="140" rx="20" fill="#0e1017" stroke="#232733" />
              <text x="770" y="194" className="fill-[#f2f3f7] font-display" fontSize="24" fontWeight="700">
                PostgreSQL
              </text>
              <text x="770" y="222" className="fill-[#9aa1b5]" fontSize="14">
                Version 16
              </text>
              <text x="770" y="248" className="fill-[#9aa1b5]" fontSize="14">
                Seeded sample data
              </text>

              {/* CI sits outside the stack and watches every change. */}
              <rect x="48" y="448" width="864" height="56" rx="16" fill="#0e1017" stroke="#3dff6e" strokeOpacity="0.45" />
              <circle cx="80" cy="476" r="5" fill="#3dff6e" />
              <text x="100" y="481" className="fill-[#f2f3f7] font-display" fontSize="16" fontWeight="700">
                GitHub Actions
              </text>
              <text x="252" y="481" className="fill-[#9aa1b5]" fontSize="14">
                lint · tests · Trivy · CodeQL · gitleaks · Docker smoke test, on every pull request
              </text>
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
