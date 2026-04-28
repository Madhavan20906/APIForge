import { useState } from "react";
import { Copy, Download, Search, AlertCircle, Zap, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { JsonView } from "./JsonView";
import { TreeView } from "./TreeView";
import { TableView } from "./TableView";
import { formatBytes } from "@/lib/http";
import type { ResponseData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  response: ResponseData | null;
  loading: boolean;
}

function statusClass(status: number) {
  if (status === 0) return "bg-destructive/15 text-destructive border-destructive/30";
  if (status >= 500) return "bg-destructive/15 text-destructive border-destructive/30";
  if (status >= 400) return "bg-warning/15 text-warning border-warning/30";
  if (status >= 300) return "bg-info/15 text-info border-info/30";
  return "bg-success/15 text-success border-success/30";
}

function arrayToCsv(arr: unknown[]): string {
  if (!arr.length) return "";
  const allObj = arr.every((r) => r && typeof r === "object" && !Array.isArray(r));
  if (!allObj) return arr.map((v) => JSON.stringify(v)).join("\n");
  const cols = Array.from(new Set(arr.flatMap((r) => Object.keys(r as Record<string, unknown>))));
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...arr.map((r) => cols.map((c) => escape((r as Record<string, unknown>)[c])).join(","))].join("\n");
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResponseViewer({ response, loading }: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("json");

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Sending request…</p>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <p className="text-sm">Send a request to see the response here.</p>
      </Card>
    );
  }

  const isFast = response.timeMs < 200;
  const isSlow = response.timeMs > 500;

  const copyAll = () => {
    navigator.clipboard.writeText(typeof response.data === "string" ? response.rawText : JSON.stringify(response.data, null, 2));
    toast.success("Response copied");
  };

  const exportJson = () =>
    download("response.json", JSON.stringify(response.data, null, 2), "application/json");

  const exportCsv = () => {
    const arr = Array.isArray(response.data)
      ? response.data
      : response.data && typeof response.data === "object"
      ? Object.values(response.data as Record<string, unknown>).find((v) => Array.isArray(v)) as unknown[] | undefined
      : null;
    if (!arr || !arr.length) {
      toast.error("No tabular array to export");
      return;
    }
    download("response.csv", arrayToCsv(arr), "text/csv");
  };

  return (
    <Card className="overflow-hidden">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <div className={cn("px-2.5 py-1 rounded-md border text-xs font-mono font-bold", statusClass(response.status))}>
          {response.status === 0 ? "ERR" : response.status} {response.statusText}
        </div>
        <div className={cn("flex items-center gap-1.5 text-xs font-mono", isSlow ? "text-warning" : isFast ? "text-success" : "text-muted-foreground")}>
          {isFast ? <Zap className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {response.timeMs} ms
        </div>
        <div className="text-xs font-mono text-muted-foreground">{formatBytes(response.sizeBytes)}</div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyAll}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={exportJson}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
          </Button>
        </div>
      </div>

      {response.error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-destructive/10 border-b border-destructive/30 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{response.error}</span>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>
          {(tab === "json" || tab === "tree") && (
            <div className="ml-auto relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search in response…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          )}
        </div>
        <div className="max-h-[60vh] overflow-auto bg-background">
          <TabsContent value="json" className="m-0">
            <JsonView data={response.data} search={search} />
          </TabsContent>
          <TabsContent value="tree" className="m-0">
            <TreeView data={response.data} search={search} />
          </TabsContent>
          <TabsContent value="table" className="m-0">
            <TableView data={response.data} />
          </TabsContent>
          <TabsContent value="headers" className="m-0 p-4">
            <table className="text-sm font-mono w-full">
              <tbody>
                {Object.entries(response.headers).map(([k, v]) => (
                  <tr key={k} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-json-key align-top">{k}</td>
                    <td className="py-1.5 text-foreground break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="raw" className="m-0">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">{response.rawText}</pre>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
