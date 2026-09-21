import { useEffect, useState } from "react";
import { config } from "../config";
import { ArrowUpRight } from "./icons";

const links = [
  ["Try it", "#try"],
  ["Under the hood", "#hood"],
  ["Architecture", "#architecture"],
  ["Straight talk", "#notes"],
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-black ring-1 ring-white/15">
            <img src="/logo.webp" alt="" width={36} height={36} className="h-full w-full scale-[1.12] object-cover" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.14em]">WARRIORS GYM</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center md:flex">
            {links.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="rounded-full px-4 py-2 font-display text-sm font-bold tracking-wide text-muted transition hover:text-text">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={config.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-neon/70 px-4 py-2 font-display text-sm font-bold tracking-wide transition hover:bg-neon/10"
          >
            Source <ArrowUpRight width={15} height={15} />
          </a>
        </div>
      </nav>
    </header>
  );
}
