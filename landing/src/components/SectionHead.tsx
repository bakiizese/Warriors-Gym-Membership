import type { ReactNode } from "react";

/** Numbered section opener: "01 ── Kicker", a big title and an optional lede. */
export function SectionHead({
  index,
  kicker,
  title,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="label flex items-center gap-3">
        <span className="ribbon !px-5 !py-0.5 !text-[0.72rem]">{index}</span>
        {kicker}
      </p>
      <h2 className="mt-4 text-4xl leading-[1.02] tracking-tight sm:text-5xl">{title}</h2>
      {children && <p className="mt-5 text-lg leading-relaxed text-muted">{children}</p>}
    </div>
  );
}
