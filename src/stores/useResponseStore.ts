import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useWorkspaceStore } from "./useWorkspaceStore";
import { useExecutionStore } from "./useExecutionStore";

export interface ResponseState {
  status: number | null | undefined;
  body: string;
  size: number;
  headers: Record<string, string[]>;
  timeTaken: number | null;
  bodyBinary: Uint8Array;
  bodyB64?: string;
  body_type: string;
  error?: string | null;
}

function createResponse(): ResponseState {
  return {
    status: null,
    body: "",
    size: 0,
    headers: {},
    timeTaken: null,
    bodyBinary: new Uint8Array(0),
    body_type: "text/plain",
    error: null,
  };
}

export const useResponseStore = defineStore("response", () => {
  const workspace = useWorkspaceStore();
  const executionStore = useExecutionStore();
  const responses = ref<Record<string, ResponseState>>({});
  for (const tab of workspace.tabs) responses.value[tab.id] = createResponse();
  const emptyResponse = createResponse();
  const activeResponse = computed(
    () =>
      (workspace.activeTabId && responses.value[workspace.activeTabId]) ||
      emptyResponse,
  );
  const status = computed(() => {
    if (
      workspace.activeTabId &&
      executionStore.executions[workspace.activeTabId]?.status === "pending"
    )
      return undefined;
    return activeResponse.value.status;
  });
  const body = computed(() => activeResponse.value.body);
  const headers = computed(() => activeResponse.value.headers);
  const timeTaken = computed(() => activeResponse.value.timeTaken);
  const size = computed(() => activeResponse.value.size);
  const bodyBinaryB64 = computed(() => activeResponse.value.bodyB64 ?? "");
  const contentType = computed(() => {
    const response = activeResponse.value;
    const header = Object.keys(response.headers).find(
      (key) => key.toLowerCase() === "content-type",
    );
    return (
      (header && response.headers[header]?.[0]) ||
      response.body_type ||
      "text/plain"
    );
  });
  const hexViewerBuffer = computed(() => activeResponse.value.bodyBinary);
  const error = computed(() => activeResponse.value.error ?? null);

  function initializeResponse(tabId: string) {
    if (!responses.value[tabId]) responses.value[tabId] = createResponse();
  }
  function setResponse(payload: ResponseState, tabId = workspace.activeTabId) {
    // A late result must never recreate a closed tab.
    if (!tabId || !responses.value[tabId]) return;
    responses.value[tabId] = {
      ...payload,
      bodyBinary: new Uint8Array(payload.bodyBinary),
      error: payload.error ?? null,
    };
  }
  function clearResponse(tabId: string) {
    if (responses.value[tabId]) responses.value[tabId] = createResponse();
  }
  function deleteResponse(tabId: string) {
    delete responses.value[tabId];
  }
  function getResponse(tabId: string) {
    return responses.value[tabId];
  }

  return {
    responses,
    status,
    body,
    headers,
    timeTaken,
    size,
    bodyBinaryB64,
    contentType,
    hexViewerBuffer,
    error,
    initializeResponse,
    setResponse,
    clearResponse,
    deleteResponse,
    getResponse,
  };
});
