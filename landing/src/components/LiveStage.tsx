import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { passes, tours } from "../content";
import { PlayIcon } from "./icons";
import { PhoneFrame } from "./PhoneFrame";

type Tab = "member" | "admin";

const tabs: Record<Tab, { label: string; app: string; url: string; poster: string; pass: (typeof passes)[keyof typeof passes] }> = {
  member: {
    label: "Member app",
    app: "Member",
    url: config.memberMobileUrl,
    poster: "/screens/member-dashboard.webp",
    pass: passes.member,
  },
  admin: {
    label: "Admin app",
    app: "Admin",
    url: config.adminMobileUrl,
    poster: "/screens/admin-dashboard.webp",
    pass: passes.admin,
  },
};

/** The apps were built for a 390px-wide phone, so render them at that size and scale the frame down to fit. */
function ScaledIframe({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 390));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      <iframe
        title={title}
        src={src}
        allow="camera; clipboard-write"
        className="absolute left-0 top-0 border-0 bg-black"
        style={{ width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
}

export function LiveStage() {
  const [tab, setTab] = useState<Tab>("member");
  const [started, setStarted] = useState<Record<Tab, boolean>>({ member: false, admin: false });
  const current = tabs[tab];

  return (
    <div className="mt-24 grid items-center gap-12 lg:mt-32 lg:grid-cols-[minmax(0,34rem)_auto] lg:justify-center lg:gap-28">
      <div className="max-w-xl">
        <p className="label !text-gold">Or try it right here</p>
        <h3 className="mt-3 text-3xl leading-tight sm:text-4xl">The real app, inside this page.</h3>
        <p className="mt-4 leading-relaxed text-muted">
          This is the same build as the link above, running in a frame. If the free server is asleep the first sign-in can take up to 30
          seconds.
        </p>

        <div role="tablist" aria-label="Which app to preview" className="mt-7 inline-flex rounded-full border border-line bg-panel p-1">
          {(Object.keys(tabs) as Tab[]).map((key) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-5 py-2 font-display text-sm font-bold tracking-wide transition ${tab === key ? "bg-red text-white" : "text-muted hover:text-text"
                }`}
            >
              {tabs[key].label}
            </button>
          ))}
        </div>

        <ol className="mt-8 space-y-4">
          {tours[tab].map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="w-6 shrink-0 text-center font-display text-2xl font-bold leading-none text-gold">{i + 1}</span>
              <span className="leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 rounded-xl border border-line bg-panel px-4 py-3 font-mono text-sm text-muted">
          Sign in with <span className="text-gold">{current.pass.phone}</span> / <span className="text-gold">{current.pass.password}</span>
        </p>
      </div>

      <PhoneFrame className="w-[300px] sm:w-[320px]">
        {(Object.keys(tabs) as Tab[]).map((key) => (
          <div key={key} role="tabpanel" hidden={tab !== key} className={tab === key ? "absolute inset-0" : ""}>
            {started[key] ? (
              <ScaledIframe src={tabs[key].url} title={`${tabs[key].app} app, live`} />
            ) : (
              <div className="absolute inset-0">
                <img src={tabs[key].poster} alt="" className="h-full w-full object-cover object-top opacity-55" />
                <div className="absolute inset-0 grid place-items-center bg-black/40">
                  <button type="button" onClick={() => setStarted((s) => ({ ...s, [key]: true }))} className="btn btn-red">
                    <PlayIcon width={16} height={16} /> Start live preview
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </PhoneFrame>
    </div>
  );
}
