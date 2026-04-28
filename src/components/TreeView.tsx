import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeProps {
  k?: string | number;
  value: unknown;
  depth: number;
  search?: string;
  defaultOpen?: boolean;
}

function matches(s: string, search?: string) {
  if (!search?.trim()) return false;
  return s.toLowerCase().includes(search.toLowerCase());
}

function PrimitiveValue({ value, search }: { value: unknown; search?: string }) {
  if (value === null) return <span className="text-json-null">null</span>;
  if (typeof value === "boolean") return <span className="text-json-boolean">{String(value)}</span>;
  if (typeof value === "number") return <span className="text-json-number">{value}</span>;
  const str = String(value);
  const hit = matches(str, search);
  return (
    <span className={cn("text-json-string", hit && "bg-warning/40 text-foreground rounded px-0.5")}>
      "{str}"
    </span>
  );
}

function TreeNode({ k, value, depth, search, defaultOpen }: NodeProps) {
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  const [open, setOpen] = useState(defaultOpen ?? depth < 2);

  const keyStr = k !== undefined ? String(k) : "";
  const keyHit = matches(keyStr, search);

  if (!isObj) {
    return (
      <div className="flex items-start font-mono text-sm py-0.5" style={{ paddingLeft: depth * 16 }}>
        {k !== undefined && (
          <>
            <span className={cn("text-json-key", keyHit && "bg-warning/40 text-foreground rounded px-0.5")}>
              {keyStr}
            </span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        <PrimitiveValue value={value} search={search} />
      </div>
    );
  }

  const entries = isArr
    ? (value as unknown[]).map((v, i) => [i, v] as const)
    : Object.entries(value as Record<string, unknown>);

  return (
    <div className="font-mono text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full hover:bg-accent/50 rounded py-0.5 text-left"
        style={{ paddingLeft: depth * 16 }}
      >
        <ChevronRight className={cn("h-3.5 w-3.5 mr-1 text-muted-foreground transition-transform", open && "rotate-90")} />
        {k !== undefined && (
          <>
            <span className={cn("text-json-key", keyHit && "bg-warning/40 text-foreground rounded px-0.5")}>
              {keyStr}
            </span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        <span className="text-muted-foreground">
          {isArr ? `Array(${entries.length})` : `Object {${entries.length}}`}
        </span>
      </button>
      {open && (
        <div>
          {entries.map(([ck, cv]) => (
            <TreeNode key={String(ck)} k={ck} value={cv} depth={depth + 1} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({ data, search }: { data: unknown; search?: string }) {
  return (
    <div className="p-4">
      <TreeNode value={data} depth={0} search={search} defaultOpen />
    </div>
  );
}
