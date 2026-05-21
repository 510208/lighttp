import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface ResponseState {
  status: number | null | undefined; // null 表示還未發出請求，undefined 表示正在等待回應
  body: string;
  size: number;
  headers: Record<string, string>;
  timeTaken: number | null;
  bodyBinary: Blob;
  body_type: string;
}

export const useResponseStore = defineStore("response", () => {
  const status = ref<number | null | undefined>(null);
  const body = ref<string>("");
  const headers = ref<Record<string, string>>({});
  const timeTaken = ref<number | null>(null);
  const bodyBinary = ref<Blob>(new Blob());
  const contentType = ref<string>("text/plain");
  const hexViewerBuffer = ref<Uint8Array>(new Uint8Array(0));

  // 計算body的檔案大小
  const size = ref<number>(0);
  watch(body, (newBody) => {
    size.value = new Blob([newBody]).size;
  });

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
      contentType.value = headers.value["Content-Type"] || "text/plain";

      const incomingBlob = responseObj.bodyBinary || new Blob();
      bodyBinary.value = incomingBlob;

      // 核心轉換邏輯：將 Blob 轉換為 Uint8Array
      if (incomingBlob.size > 0) {
        // 利用 Blob 原生的 arrayBuffer 異步方法獲取底層二進位數據
        const arrayBuffer = await incomingBlob.arrayBuffer();
        hexViewerBuffer.value = new Uint8Array(arrayBuffer);
      } else {
        hexViewerBuffer.value = new Uint8Array(0);
      }

      console.log("[setResponse] Response payload type:", contentType.value);
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
    bodyBinary,
    contentType,
    hexViewerBuffer,

    setStatus,
    setResponse,
  };
});
