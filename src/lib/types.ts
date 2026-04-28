export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  bearerToken: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  rawText: string;
  timeMs: number;
  sizeBytes: number;
  ok: boolean;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  request: RequestConfig;
  status?: number;
  timeMs?: number;
  timestamp: number;
  error?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  request: RequestConfig;
  createdAt: number;
}
