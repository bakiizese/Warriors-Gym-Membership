import { isLocalAddress } from "../config";
import { passes, type doors } from "../content";
import { CopyButton } from "./CopyButton";
import { ArrowUpRight, DownloadIcon } from "./icons";
import { QrCode } from "./QrCode";

type Door = (typeof doors)[number];

/** One way into the demo, laid out like a gym pass: preview on top, tear-off stub below. */
export function Pass({ door, openUrl, apkUrl }: { door: Door; openUrl: string; apkUrl: string }) {
  const pass = passes[door.pass];
  const isPhone = door.frame === "phone";
  const showQr = isPhone && !isLocalAddress(openUrl);

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_46px_-14px_rgb(61_255_110/0.45)]">
      {/* Preview: the top of a real screenshot, cropped by the card. */}
      <div className="relative h-56 overflow-hidden border-b border-line bg-[radial-gradient(90%_80%_at_50%_0%,rgb(74_91_134/0.5),transparent_75%)]">
        {isPhone ? (
          <img
            src={door.shot}
            alt={door.shotAlt}
            width={390}
            height={844}
            loading="lazy"
            className="mx-auto mt-6 w-[44%] rounded-t-[1.7rem] border-x-[6px] border-t-[6px] border-[#0b0c11] shadow-[0_20px_40px_-10px_rgb(0_0_0/0.8)] transition duration-500 group-hover:-translate-y-1"
          />
        ) : (
          <div className="mx-6 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-line bg-[#0b0c11] shadow-[0_20px_40px_-10px_rgb(0_0_0/0.8)] transition duration-500 group-hover:-translate-y-1">
            <div className="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
            </div>
            <img src={door.shot} alt={door.shotAlt} width={1920} height={1200} loading="lazy" className="block w-full" />
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-panel to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6 pb-5">
        <p className="label !text-gold">{door.kicker}</p>
        <h3 className="mt-2 text-3xl leading-none">{door.title}</h3>
        <p className="mt-3 leading-relaxed text-muted">{door.body}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {door.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Tear-off line with the punched notches of a ticket. */}
      <div className="relative h-px" aria-hidden>
        <div className="absolute inset-x-5 border-t border-dashed border-line" />
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-line bg-ink" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-line bg-ink" />
      </div>

      {/* Same minimum height on every card, so the tear-off lines line up. */}
      <div className="p-6 pt-5 lg:min-h-[17.5rem]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="label !text-[0.68rem]">
              Demo pass · {pass.who}
            </p>
            <dl className="mt-3 space-y-1.5 font-mono text-sm">
              {(
                [
                  ["Phone", pass.phone],
                  ["Password", pass.password],
                ] as const
              ).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-black/35 py-0.5 pl-3 pr-1">
                  <dt className="text-xs uppercase tracking-wider text-muted">{name}</dt>
                  <dd className="flex items-center gap-1 tabular-nums text-gold">
                    {value}
                    <CopyButton value={value} label={`${door.title} ${name.toLowerCase()}`} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {showQr && (
            <figure className="hidden shrink-0 text-center sm:block">
              <QrCode value={openUrl} label={`QR code that opens ${door.title} on your phone`} />
              <figcaption className="mt-1.5 text-[0.65rem] uppercase tracking-wider text-muted">Scan for phone</figcaption>
            </figure>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-red">
            Open live <ArrowUpRight />
          </a>
          {isPhone && apkUrl && (
            <a href={apkUrl} className="btn btn-ring" download>
              Android APK <DownloadIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
