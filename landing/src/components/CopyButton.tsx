import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Not a secure context or permission denied: fall back to a hidden textarea.
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await writeClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      data-copied={copied}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-text data-[copied=true]:text-neon"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span role="status" className="sr-only">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  );
}
