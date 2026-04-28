import { cn } from "@/lib/utils";
import type { HttpMethod } from "@/lib/types";

const colors: Record<HttpMethod, string> = {
  GET: "text-method-get",
  POST: "text-method-post",
  PUT: "text-method-put",
  DELETE: "text-method-delete",
  PATCH: "text-method-put",
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
  return (
    <span className={cn("font-mono text-xs font-bold tracking-wide", colors[method], className)}>
      {method}
    </span>
  );
}
