import { useEffect, useState } from "react";

/** A scannable QR for `value`, drawn as SVG. The library loads on demand. */
export function QrCode({ value, label, size = 92 }: { value: string; label: string; size?: number }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let alive = true;
    void import("qrcode").then(async (qr) => {
      const markup = await qr.toString(value, {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#0b0c11", light: "#f4f1ea" },
      });
      if (alive) setSvg(markup);
    });
    return () => {
      alive = false;
    };
  }, [value]);

  if (!svg) return <div aria-hidden style={{ width: size, height: size }} />;

  return (
    <div
      role="img"
      aria-label={label}
      className="shrink-0 overflow-hidden rounded-xl bg-[#f4f1ea] [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
