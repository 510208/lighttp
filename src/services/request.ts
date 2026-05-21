import { invoke } from "@tauri-apps/api/core";
import { useRequestStore } from "@/stores/useRequestStore";
import {
  type ResponseState,
  useResponseStore,
} from "@/stores/useResponseStore";

import { toast } from "vue-sonner";

function base64ToBlob(base64Str: string, mimeType: string): Blob {
  try {
    let cleanBase64 = base64Str;

    // 防禦性處理：若包含 Data URL 前綴（有逗號），則擷取後半段；否則直接使用原字串
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1];
    }

    // 將 URL 安全型字元轉換為標準 Base64 字元（預防性清洗）
    cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");

    // 補齊可能缺失的等號填充符
    const padLength = cleanBase64.length % 4;
    if (padLength > 0) {
      cleanBase64 += "=".repeat(4 - padLength);
    }

    // 解碼為二進位字串
    const byteString = window.atob(cleanBase64);
    const length = byteString.length;

    // 分配連續記憶體緩衝區
    const arrayBuffer = new ArrayBuffer(length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mimeType });
  } catch (error) {
    console.error(
      "[base64ToBlob] 轉換失敗，傳入數據：",
      {
        preview: base64Str?.substring(0, 30),
        length: base64Str?.length,
      },
      error,
    );
    return new Blob([], { type: mimeType });
  }
}

async function sendRequest(): Promise<ResponseState | null> {
  const requestStore = useRequestStore();
  const responseStore = useResponseStore();

  responseStore.setStatus(undefined); // 重置狀態

  if (requestStore.method === "NONE") {
    console.warn("未選擇 HTTP 方法，跳過請求");
    return null;
  }

  // 初始化計時
  const startTime = performance.now();

  try {
    console.log(
      `[handleSend] Sending ${requestStore.method} request to: ${requestStore.url}`,
    );

    // 使用 await 等待 Rust 後端回傳，response 為物件
    const response = await invoke<any>("handle_request", {
      payload: requestStore.getRequestData(),
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log("[handleSend] Response from Rust:", response);

    const responseDataParsed: ResponseState = {
      status: response.status,
      body: response.body,
      headers: response.headers,
      timeTaken: duration,
      body_type: response.body_type || "text/plain",
      size: new Blob([response.body]).size,
      bodyBinary: base64ToBlob(
        response.bodyBinaryB64 || "",
        response.body_type || "application/octet-stream",
      ),
    };

    // toast.success(
    //   `已收到回應: ${responseDataParsed.status} (${duration.toFixed(2)} ms)`,
    // );

    return responseDataParsed;
  } catch (error) {
    console.error("[handleSend] Rust Command Error:", error);
    throw error;
  }
}

async function handleSend() {
  const responseStore = useResponseStore();
  const requestStore = useRequestStore();

  // 使用 toast.promise 自動管理狀態
  toast.promise(sendRequest(), {
    loading: `正在發送 ${requestStore.method} 請求至 ${requestStore.url}...`,
    success: async (data: ResponseState | null) => {
      await new Promise((resolve) => setTimeout(resolve, 200)); // 模擬處理時間，讓 loading 狀態更明顯
      // 當 sendRequest resolve 時執行
      if (data) {
        await responseStore.setResponse(data);
        return `收到結果: ${data.status} (${data.timeTaken != null ? data.timeTaken.toFixed(2) : "NaN"} ms)`;
      }
      return "請求完成";
    },
    error: (err: unknown) => {
      // 當 sendRequest reject 時執行
      return `發送失敗: ${(err as Error).message || String(err)}`;
    },
  });
}

export { handleSend };
