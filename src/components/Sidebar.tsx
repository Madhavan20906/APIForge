import { Trash2, History, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MethodBadge } from "./MethodBadge";
import type { CollectionItem, HistoryEntry, RequestConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  history: HistoryEntry[];
  collections: CollectionItem[];
  onLoad: (r: RequestConfig) => void;
  onClearHistory: () => void;
  onDeleteCollection: (id: string) => void;
}

function statusDot(status?: number) {
  if (!status) return "bg-destructive";
  if (status >= 500) return "bg-destructive";
  if (status >= 400) return "bg-warning";
  if (status >= 200 && status < 300) return "bg-success";
  return "bg-muted-foreground";
}

export function Sidebar({ history, collections, onLoad, onClearHistory, onDeleteCollection }: Props) {
  return (
    <aside className="w-72 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
          <span className="text-primary font-mono font-bold text-sm">{}</span>
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none">ReqLab</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Mini API Debugger</p>
        </div>
      </div>

      <Tabs defaultValue="history" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-3 grid grid-cols-2">
          <TabsTrigger value="history" className="text-xs">
            <History className="h-3.5 w-3.5 mr-1.5" /> History
          </TabsTrigger>
          <TabsTrigger value="collections" className="text-xs">
            <FolderOpen className="h-3.5 w-3.5 mr-1.5" /> Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="flex-1 overflow-hidden m-0 mt-2">
          <div className="px-3 pb-2 flex justify-end">
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-7 text-xs">
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-full px-2">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-4">
                No requests yet. Send one to start tracking history.
              </p>
            ) : (
              <div className="space-y-1 pb-4">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => onLoad(h.request)}
                    className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDot(h.status))} />
                      <MethodBadge method={h.request.method} />
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                        {h.timeMs ? `${h.timeMs}ms` : "—"}
                      </span>
                    </div>
                    <p className="text-xs font-mono truncate text-foreground/80 group-hover:text-foreground">
                      {h.request.url}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="collections" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-full px-2">
            {collections.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-4">
                No saved requests. Click the save icon to add one.
              </p>
            ) : (
              <div className="space-y-1 pb-4">
                {collections.map((c) => (
                  <div key={c.id} className="group flex items-stretch rounded-md hover:bg-sidebar-accent">
                    <button onClick={() => onLoad(c.request)} className="flex-1 text-left p-2 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MethodBadge method={c.request.method} />
                        <span className="text-xs font-medium truncate">{c.name}</span>
                      </div>
                      <p className="text-[10px] font-mono truncate text-muted-foreground">
                        {c.request.url}
                      </p>
                    </button>
                    <button
                      onClick={() => onDeleteCollection(c.id)}
                      className="px-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
