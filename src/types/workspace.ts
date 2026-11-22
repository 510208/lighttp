import type { KeyValuePair } from "@/composables/useTableManager";
import type { AuthStore } from "@/stores/authType";
import type { ProxyConfig } from "@/stores/proxyConfig";

export interface WorkspaceTab {
  id: string;
  title: string;
  type: "request";
  createdAt: number;
  updatedAt: number;
}

export interface RequestState {
  method: string;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  auth: AuthStore;
  bodyType: string;
  bodyContent: string;
  proxyConfig: ProxyConfig;
}

export type ExecutionStatus =
  | "idle"
  | "pending"
  | "success"
  | "error"
  | "cancelled";

export interface RequestExecution {
  id: string;
  tabId: string;
  status: ExecutionStatus;
  startedAt: number;
  completedAt: number | null;
  duration: number | null;
  error: string | null;
}
