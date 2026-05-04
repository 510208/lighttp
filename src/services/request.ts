import { invoke } from "@tauri-apps/api/core";
import { useRequestStore } from "@/stores/useRequestStore";
import {
  type ResponseState,
  useResponseStore,
} from "@/stores/useResponseStore";

async function sendRequest(): Promise<ResponseState | null> {
  const requestStore = useRequestStore();

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

    return responseDataParsed;
  } catch (error) {
    const endTime = performance.now();
    console.error("[handleSend] Error invoking Rust command:", error);

    // 即使失敗，可能也想回傳一個錯誤狀態給前端顯示
    return {
      status: 500,
      body: String(error),
      headers: {},
      timeTaken: endTime - startTime, // 單位：毫秒
    };
  }
}

// 4. 呼叫端也要改為 async
async function handleSend() {
  const response = await sendRequest();
  console.log("[handleSend] Response:", response);

  const responseStore = useResponseStore();
  if (response) {
    responseStore.setResponse(response);
  }

  console.log("[handleSend] Updated response store:", {
    status: responseStore.status,
    headers: responseStore.headers,
    body: responseStore.body,
    timeTaken: responseStore.timeTaken,
  });
}

export { handleSend };
