import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface ResponseState {
  status: number | null | undefined; // null 表示還未發出請求，undefined 表示正在等待回應
  body: string;
  size: number;
  headers: Record<string, string[]>;
  timeTaken: number | null;
  bodyBinary: Uint8Array;
  bodyB64?: string; // 可選的 base64 編碼字串，保留以供前端使用
  body_type: string;
}

export const useResponseStore = defineStore("response", () => {
  const status = ref<number | null | undefined>(null);
  const body = ref<string>("");
  const headers = ref<Record<string, string[]>>({});
  const timeTaken = ref<number | null>(null);
  const bodyBinaryB64 = ref<string>(""); // 用於存儲從 Rust 後端接收到的 base64 編碼字串
  const contentType = ref<string>("text/plain");
  const hexViewerBuffer = ref<Uint8Array>(new Uint8Array(0));

  // 計算body的檔案大小
  const size = ref<number>(0);
  watch(body, (newBody) => {
    size.value = new Blob([newBody]).size;
  });

  function getHeaderCaseInsensitive(
    targetKey: string,
    headersMap: Record<string, string[]>,
  ): string[] | undefined {
    const lowerKey = targetKey.toLowerCase();
    const foundKey = Object.keys(headersMap).find(
      (key) => key.toLowerCase() === lowerKey,
    );
    return foundKey ? headersMap[foundKey] : undefined;
  }

  async function setResponse(payload: any) {
    try {
      let responseObj: ResponseState;
      if (typeof payload === "string") {
        responseObj = JSON.parse(payload);
      } else {
        responseObj = payload;
      }
      console.log("[setResponse] Parsed response payload:", responseObj);

      status.value = responseObj.status;
      headers.value = responseObj.headers;
      body.value = responseObj.body;
      timeTaken.value = responseObj.timeTaken;

      const foundContentType = getHeaderCaseInsensitive(
        "content-type",
        headers.value,
      );
      contentType.value = foundContentType?.[0] || "text/plain";

      bodyBinaryB64.value = responseObj.bodyB64 || "";
      hexViewerBuffer.value = new Uint8Array(responseObj.bodyBinary);

      console.log("[setResponse] Response payload type:", contentType.value);
      console.log("[setResponse] ResponseStore:", {
        status: status.value,
        headers: headers.value,
        body: body.value,
        timeTaken: timeTaken.value,
        contentType: contentType.value,
        bodyBinaryB64: bodyBinaryB64.value,
        hexViewerBuffer: hexViewerBuffer.value,
      });
    } catch (e) {
      console.error("[setResponse] Failed to parse response payload:", e);
      status.value = null;
      headers.value = {};
      body.value = "";
      timeTaken.value = null;
      contentType.value = "text/plain";
      hexViewerBuffer.value = new Uint8Array(0);
    }
  }

  function setStatus(newStatus: number | null | undefined) {
    status.value = newStatus;
  }

  return {
    status,
    headers,
    body,
    timeTaken,
    size,
    bodyBinaryB64,
    contentType,
    hexViewerBuffer,

    setStatus,
    setResponse,
  };
});
