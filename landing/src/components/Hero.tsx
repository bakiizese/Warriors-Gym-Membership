import { config } from "../config";
import { contact, hero } from "../content";
import { ApiStatus } from "./ApiStatus";
import { ArrowUpRight } from "./icons";
import { PhoneFrame } from "./PhoneFrame";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 sm:pt-36">
      {/* The apps' slate-to-tan gradient, as a glow behind the phones. */}
      <div aria-hidden className="hero-glow absolute inset-0 -z-10" />
      <img
        aria-hidden
        alt=""
        src="/logo.webp"
        width={640}
        height={640}
        className="absolute -right-28 top-20 -z-10 hidden w-[640px] opacity-[0.06] grayscale lg:block"
      />

      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-5 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="ribbon">{hero.eyebrow}</span>
            <span className="text-sm text-muted">{hero.eyebrowNote}</span>
          </div>

          <h1 className="mt-7 text-[clamp(2.7rem,6.7vw,5.6rem)] leading-[0.94] tracking-tight">
            <span className="block whitespace-nowrap">{hero.lines[0]}</span>
            <span className="block whitespace-nowrap">
              <span className="text-gold">Three</span> apps.
            </span>
            <span className="block whitespace-nowrap">{hero.lines[2]}</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{hero.lede}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#try" className="btn btn-red">
              Try the apps
            </a>
            <a href={config.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ring">
              Read the code <ArrowUpRight />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ApiStatus />
            <span className="text-sm text-muted">Built by {contact.name}</span>
          </div>
        </div>

        {/* Two real screenshots, overlapped like phones on a table. */}
        <div className="relative mx-auto aspect-[520/680] w-full max-w-[520px]">
          <div className="absolute right-0 top-[7%] w-[50%] rotate-[6deg] opacity-95">
            <PhoneFrame>
              <img src="/screens/admin-dashboard.webp" alt="Admin mobile app dashboard" width={780} height={1688} className="h-full w-full object-cover object-top" />
            </PhoneFrame>
          </div>
          <div className="absolute left-0 top-0 w-[54%] -rotate-[4deg] animate-float">
            <PhoneFrame>
              <img src="/screens/member-dashboard.webp" alt="Member mobile app dashboard" width={780} height={1688} className="h-full w-full object-cover object-top" />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
