import { defineStore } from "pinia";
import { ref, watch } from "vue";

/**
 * 計算 Body 數據的精確 Byte 大小
 */
function calculateBodySize(bodyData: unknown): number {
  if (!bodyData) return 0;

  // 若為 ArrayBuffer（原生二進位）
  if (bodyData instanceof ArrayBuffer) {
    return bodyData.byteLength;
  }

  // 若為 TypedArray（例如 Uint8Array）
  if (ArrayBuffer.isView(bodyData)) {
    return bodyData.byteLength;
  }

  // 若為二進位 Blob
  if (bodyData instanceof Blob) {
    return bodyData.size;
  }

  // 若為 Base64 字串（常用於 IPC 傳遞媒體檔案）
  if (typeof bodyData === "string") {
    // 判斷是否為 Base64 Data URL (e.g., "data:image/png;base64,iVBORw0KG...")
    const base64Index = bodyData.indexOf(";base64,");
    const base64Str =
      base64Index !== -1 ? bodyData.slice(base64Index + 8) : bodyData;

    // 檢查字串是否符合 Base64 格式
    if (/^[A-Za-z0-9+/=]+$/.test(base64Str.trim())) {
      const padding = (base64Str.match(/=/g) || []).length;
      return Math.floor((base64Str.length * 3) / 4) - padding;
    }

    // 普通 UTF-8 文字回應
    return new TextEncoder().encode(bodyData).length;
  }

  return 0;
}

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
  watch(
    [body, headers],
    ([newBody, newHeaders]) => {
      // 優先採用 HTTP Header 中的 Content-Length
      const contentLengthKey = Object.keys(newHeaders || {}).find(
        (k) => k.toLowerCase() === "content-length",
      );

      if (contentLengthKey && newHeaders[contentLengthKey]) {
        const headerVal = newHeaders[contentLengthKey];

        // 關鍵修復：若為陣列則取第一個元素，若為字串則直接取用
        const rawSize = Array.isArray(headerVal) ? headerVal[0] : headerVal;

        if (rawSize) {
          const parsedSize = parseInt(rawSize, 10);
          if (!isNaN(parsedSize)) {
            size.value = parsedSize;
            return;
          }
        }
      }

      // 若無 Content-Length，根據 Body 的型別精確計算
      size.value = calculateBodySize(newBody);
    },
    { immediate: true, deep: true },
  );

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
