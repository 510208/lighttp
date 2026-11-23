import { invoke } from "@tauri-apps/api/core";
import { useRequestStore } from "@/stores/useRequestStore";
import {
  useResponseStore,
  type ResponseState,
} from "@/stores/useResponseStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useExecutionStore } from "@/stores/useExecutionStore";
import { toast } from "vue-sonner";
import { validateBodyFiles } from "@/lib/requestBody";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { normalizeHttpClientConfig } from "@/lib/httpClientConfig";
import { useCookieStore } from "@/stores/useCookieStore";
import { i18n } from "@/i18n";

interface BackendResponse {
  status: number;
  body: string;
  headers: Record<string, string[]>;
  bodyType: string;
  bodyBinary: number[];
  bodyBinaryB64?: string;
}

async function handleSend() {
  const workspace = useWorkspaceStore();
  const requestStore = useRequestStore();
  const responseStore = useResponseStore();
  const executionStore = useExecutionStore();
  // Capture identity and payload before crossing any async boundary.
  const tabId = workspace.activeTabId;
  if (!tabId || !requestStore.url.trim() || requestStore.method === "NONE")
    return;

  let payload;
  try {
    validateBodyFiles(requestStore);
    payload = {
      ...requestStore.getRequestData(),
      // 每次送出時擷取全域設定，避免影響執行中的請求與匯出的請求草稿。
      httpClientConfig: normalizeHttpClientConfig(
        useSettingsStore().httpClientConfig,
      ),
    };
    if (
      payload.cookieIds.length &&
      payload.headers.some((header) => header.key.toLowerCase() === "cookie")
    ) {
      throw new Error(i18n.global.t("cookies.header_conflict"));
    }
    if (!/^https?:\/\//i.test(payload.url))
      payload.url = "http://" + payload.url;
    const url = new URL(payload.url);
    requestStore.updateRequest(tabId, { url: url.href });
    payload.url = url.href;
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new Error("Only HTTP and HTTPS URLs are supported.");
  } catch (error) {
    toast.error(String(error));
    return;
  }

  const requestId = executionStore.startExecution(tabId);
  const signal = executionStore.getSignal(requestId)!;
  const startedAt = performance.now();
  const toastId = toast.loading(payload.method + " " + payload.url);
  const cancel = () => {
    toast.dismiss(toastId);
    void invoke("cancel_request", { requestId }).catch((error) => {
      console.warn("Failed to cancel request:", error);
    });
  };
  signal.addEventListener("abort", cancel, { once: true });

  try {
    const response = await invoke<BackendResponse>("handle_request", {
      payload,
      requestId,
    });
    if (!executionStore.isCurrent(tabId, requestId)) return;
    const timeTaken = performance.now() - startedAt;
    const data: ResponseState = {
      status: response.status,
      body: response.body,
      headers: response.headers,
      timeTaken,
      body_type: response.bodyType,
      size: response.bodyBinary.length,
      bodyBinary: new Uint8Array(response.bodyBinary),
      bodyB64: response.bodyBinaryB64,
      error:
        response.bodyType === "text" && response.status >= 400
          ? response.body
          : null,
    };
    responseStore.setResponse(data, tabId);
    executionStore.finishExecution(
      tabId,
      requestId,
      data.error || (response.status >= 400 ? "HTTP " + response.status : null),
    );
    const message = response.status + " (" + timeTaken.toFixed(2) + " ms)";
    if (response.status >= 400) toast.error(message, { id: toastId });
    else toast.success(message, { id: toastId });
  } catch (error) {
    if (!executionStore.isCurrent(tabId, requestId)) return;
    const message = error instanceof Error ? error.message : String(error);
    responseStore.setResponse(
      {
        status: 500,
        body: message,
        headers: {},
        size: 0,
        timeTaken: performance.now() - startedAt,
        body_type: "text/plain",
        bodyBinary: new Uint8Array(0),
        error: message,
      },
      tabId,
    );
    executionStore.finishExecution(tabId, requestId, message);
    toast.error(message, { id: toastId });
  } finally {
    signal.removeEventListener("abort", cancel);
    // 即使請求取消或本文讀取失敗，先前的回應仍可能已經更新 Cookie。
    void useCookieStore()
      .refresh()
      .catch((error) => {
        toast.error(String(error));
      });
  }
}

export { handleSend };
