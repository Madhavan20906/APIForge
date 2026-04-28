import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { RequestBuilder } from "@/components/RequestBuilder";
import { ResponseViewer } from "@/components/ResponseViewer";
import { sendRequest } from "@/lib/http";
import {
  addHistoryEntry,
  clearHistory,
  loadCollections,
  loadHistory,
  saveCollections,
} from "@/lib/storage";
import type {
  CollectionItem,
  HistoryEntry,
  RequestConfig,
  ResponseData,
} from "@/lib/types";
import { uid } from "@/lib/utils-id";

export const Route = createFileRoute("/")({
  component: Index,
});

const defaultRequest = (): RequestConfig => ({
  url: "https://jsonplaceholder.typicode.com/users",
  method: "GET",
  headers: [{ id: uid(), key: "Accept", value: "application/json", enabled: true }],
  params: [],
  body: "",
  bearerToken: "",
});

function Index() {
  const [request, setRequest] = useState<RequestConfig>(defaultRequest);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    setCollections(loadCollections());
  }, []);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const res = await sendRequest(request);
    setResponse(res);
    setLoading(false);

    const entry: HistoryEntry = {
      id: uid(),
      request,
      status: res.status,
      timeMs: res.timeMs,
      timestamp: Date.now(),
      error: res.error,
    };
    setHistory(addHistoryEntry(entry));

    if (res.error) toast.error(res.error);
    else if (res.status >= 400) toast.warning(`${res.status} ${res.statusText}`);
    else toast.success(`${res.status} • ${res.timeMs}ms`);
  };

  const handleSaveCollection = (name: string) => {
    const item: CollectionItem = { id: uid(), name, request, createdAt: Date.now() };
    const next = [item, ...collections];
    setCollections(next);
    saveCollections(next);
    toast.success(`Saved "${name}"`);
  };

  const handleDeleteCollection = (id: string) => {
    const next = collections.filter((c) => c.id !== id);
    setCollections(next);
    saveCollections(next);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        history={history}
        collections={collections}
        onLoad={(r) => setRequest(r)}
        onClearHistory={handleClearHistory}
        onDeleteCollection={handleDeleteCollection}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">API Debugger</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Send requests, inspect responses with JSON, Tree, and Table views.
            </p>
          </header>
          <RequestBuilder
            request={request}
            onChange={setRequest}
            onSend={handleSend}
            onSaveCollection={handleSaveCollection}
            loading={loading}
          />
          <ResponseViewer response={response} loading={loading} />
        </div>
      </main>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
