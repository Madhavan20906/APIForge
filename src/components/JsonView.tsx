import { useMemo } from "react";

interface Props {
  data: unknown;
  search?: string;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function highlight(json: string, search?: string): string {
  let out = escapeHtml(json)
    .replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="text-json-key">$1</span>$2')
    .replace(/: ("(?:\\.|[^"\\])*")/g, ': <span class="text-json-string">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="text-json-boolean">$1</span>')
    .replace(/\bnull\b/g, '<span class="text-json-null">null</span>')
    .replace(/(: |\[|, )(-?\d+\.?\d*)/g, '$1<span class="text-json-number">$2</span>');

  if (search && search.trim()) {
    const safe = escapeHtml(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(safe, "gi"), (m) => `<mark class="bg-warning/40 text-foreground rounded px-0.5">${m}</mark>`);
  }
  return out;
}

export function JsonView({ data, search }: Props) {
  const html = useMemo(() => {
    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    return highlight(text, search);
  }, [data, search]);

  return (
    <pre
      className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
