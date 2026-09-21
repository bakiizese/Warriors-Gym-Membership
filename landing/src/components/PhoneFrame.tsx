import type { ReactNode } from "react";

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
        {/* Status strip in the apps' slate blue, so the camera island never covers an app's header. */}
        <div aria-hidden className="absolute inset-x-0 top-0 z-10 flex h-7 justify-center bg-[#5f6e9b] pt-1.5">
          <span className="h-4 w-[72px] rounded-full bg-black" />
        </div>
        <div className="absolute inset-x-0 bottom-0 top-7">{children}</div>
      </div>
    </div>
  );
}
