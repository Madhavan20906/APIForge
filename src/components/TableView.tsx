import { useMemo } from "react";

function findFirstArray(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const v of Object.values(data as Record<string, unknown>)) {
      if (Array.isArray(v) && v.length > 0) return v;
    }
  }
  return null;
}

export function TableView({ data }: { data: unknown }) {
  const rows = useMemo(() => findFirstArray(data), [data]);

  if (!rows || rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No tabular array found in response.
      </div>
    );
  }

  const allObjects = rows.every((r) => r && typeof r === "object" && !Array.isArray(r));
  const columns = allObjects
    ? Array.from(new Set(rows.flatMap((r) => Object.keys(r as Record<string, unknown>))))
    : ["value"];

  const cellValue = (row: unknown, col: string) => {
    const v = allObjects ? (row as Record<string, unknown>)[col] : row;
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm font-mono">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            <th className="text-left px-3 py-2 text-muted-foreground border-b border-border">#</th>
            {columns.map((c) => (
              <th key={c} className="text-left px-3 py-2 text-json-key border-b border-border whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-accent/30 border-b border-border/50">
              <td className="px-3 py-2 text-muted-foreground">{i}</td>
              {columns.map((c) => (
                <td key={c} className="px-3 py-2 max-w-xs truncate" title={cellValue(row, c)}>
                  {cellValue(row, c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
