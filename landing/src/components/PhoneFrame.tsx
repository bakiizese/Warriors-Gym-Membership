import type { ReactNode } from "react";

// The same time/signal/wifi/battery row drawn into the standalone apps'
// own phone frame (mobile/app/+html.jsx and admin-frontend/mobile/app/+html.jsx),
// kept in one place here since this is real JSX rather than a CSS string.
function StatusBarIcons() {
  return (
    <svg viewBox="0 0 350 18" className="h-full w-full" aria-hidden focusable="false">
      <text x="4" y="13" fontFamily="-apple-system,Helvetica,Arial,sans-serif" fontSize="13" fontWeight="600" fill="white">
        9:41
      </text>
      <rect x="270" y="8" width="3.2" height="5" rx="1" fill="white" />
      <rect x="275" y="6" width="3.2" height="7" rx="1" fill="white" />
      <rect x="280" y="4" width="3.2" height="9" rx="1" fill="white" />
      <rect x="285" y="2" width="3.2" height="11" rx="1" fill="white" />
      <path d="M291 8c5-5 13-5 18 0" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M295 11c3-2.5 7-2.5 10 0" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="300" cy="13.5" r="1.1" fill="white" />
      <rect x="314" y="2" width="24" height="11" rx="2.5" stroke="white" strokeWidth="1.3" fill="none" />
      <rect x="316" y="4" width="17" height="7" rx="1" fill="white" />
      <rect x="339" y="5" width="2" height="5" rx="1" fill="white" />
    </svg>
  );
}

/** A phone-shaped bezel. The screen keeps the apps' 390 x 844 proportions. */
export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[320px] rounded-[2.9rem] bg-[#0b0c11] p-[9px] ring-1 ring-white/10 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.04)_inset] ${className}`}
    >
      <span aria-hidden className="absolute -left-[3px] top-28 h-9 w-[3px] rounded-l bg-[#1b1e29]" />
      <span aria-hidden className="absolute -left-[3px] top-40 h-14 w-[3px] rounded-l bg-[#1b1e29]" />
      <span aria-hidden className="absolute -right-[3px] top-36 h-16 w-[3px] rounded-r bg-[#1b1e29]" />
      <div className="relative aspect-[390/844] overflow-hidden rounded-[2.3rem] bg-black">
        {/* A solid strip, matching the standalone apps' own frame (time, signal,
            wifi, battery, and the camera pill), so the notch never covers an
            app's real header. It has to be opaque, unlike the standalone apps'
            transparent version: this wraps a live iframe of a page hosted on
            Cloudflare Pages, and its content can't be pushed down from here. */}
        <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-7 bg-black">
          <div className="absolute inset-x-4 top-1.75 h-4.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            <StatusBarIcons />
          </div>
          <span className="absolute left-1/2 top-1.75 h-4.5 w-17.5 -translate-x-1/2 rounded-full bg-black" />
        </div>
        <div className="absolute inset-x-0 bottom-0 top-7">{children}</div>
      </div>
    </div>
  );
}
