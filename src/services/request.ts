import { invoke } from "@tauri-apps/api/core";
import { useRequestStore } from "@/stores/useRequestStore";
import {
  type ResponseState,
  useResponseStore,
} from "@/stores/useResponseStore";

import { toast } from "vue-sonner";

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

    // console.log("[handleSend] Response from Rust:", response);

    const responseDataParsed: ResponseState = {
      status: response.status,
      body: response.body,
      headers: response.headers,
      timeTaken: duration,
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
        responseStore.setResponse(data);
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
