import { useState } from "react";
import { Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { KeyValueEditor } from "./KeyValueEditor";
import type { HttpMethod, RequestConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColor: Record<HttpMethod, string> = {
  GET: "text-method-get",
  POST: "text-method-post",
  PUT: "text-method-put",
  PATCH: "text-method-put",
  DELETE: "text-method-delete",
};

interface Props {
  request: RequestConfig;
  onChange: (r: RequestConfig) => void;
  onSend: () => void;
  onSaveCollection: (name: string) => void;
  loading: boolean;
}

export function RequestBuilder({ request, onChange, onSend, onSaveCollection, loading }: Props) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const set = <K extends keyof RequestConfig>(k: K, v: RequestConfig[K]) =>
    onChange({ ...request, [k]: v });

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSaveCollection(saveName.trim());
    setSaveName("");
    setSaveOpen(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-2">
        <Select value={request.method} onValueChange={(v) => set("method", v as HttpMethod)}>
          <SelectTrigger className={cn("w-32 font-mono font-bold", methodColor[request.method])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m} className={cn("font-mono font-bold", methodColor[m])}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="https://api.example.com/endpoint"
          value={request.url}
          onChange={(e) => set("url", e.target.value)}
          className="flex-1 font-mono"
          onKeyDown={(e) => e.key === "Enter" && request.url && onSend()}
        />
        <Button onClick={onSend} disabled={loading || !request.url} className="min-w-24">
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Sending" : "Send"}
        </Button>
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" disabled={!request.url}>
              <Save className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save to Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Request name</Label>
              <Input
                placeholder="Get user profile"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="params">
        <TabsList>
          <TabsTrigger value="params">
            Params {request.params.filter((p) => p.enabled && p.key).length > 0 && `(${request.params.filter((p) => p.enabled && p.key).length})`}
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers {request.headers.filter((h) => h.enabled && h.key).length > 0 && `(${request.headers.filter((h) => h.enabled && h.key).length})`}
          </TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="pt-3">
          <KeyValueEditor items={request.params} onChange={(v) => set("params", v)} />
        </TabsContent>
        <TabsContent value="headers" className="pt-3">
          <KeyValueEditor items={request.headers} onChange={(v) => set("headers", v)} />
        </TabsContent>
        <TabsContent value="auth" className="pt-3 space-y-2">
          <Label className="text-sm">Bearer Token</Label>
          <Input
            placeholder="eyJhbGciOi..."
            value={request.bearerToken}
            onChange={(e) => set("bearerToken", e.target.value)}
            className="font-mono"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Will be sent as <code className="text-json-key">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </TabsContent>
        <TabsContent value="body" className="pt-3 space-y-2">
          <Textarea
            placeholder='{ "name": "value" }'
            value={request.body}
            onChange={(e) => set("body", e.target.value)}
            className="font-mono text-sm min-h-40"
            disabled={!["POST", "PUT", "PATCH"].includes(request.method)}
          />
          <p className="text-xs text-muted-foreground">
            JSON body for POST / PUT / PATCH. Content-Type set automatically.
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
