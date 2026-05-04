import { invoke } from "@tauri-apps/api/core";
import { useRequestStore } from "@/stores/useRequestStore";

// 處理發送邏輯
const handleSend = () => {
  const requestStore = useRequestStore();

  if (requestStore.method === "NONE") {
    console.warn("未選擇 HTTP 方法，跳過請求");
    return;
  }

  console.log(
    `Sending ${requestStore.method} request to: ${requestStore.url} with `,
    requestStore.getRequestData(),
  );

  // 發送請求到 Rust 後端
  invoke("handle_request", { payload: requestStore.getRequestData() })
    .then((response) => {
      console.log("Response from Rust:", response);
    })
    .catch((error) => {
      console.error("Error invoking Rust command:", error);
    });
};

export { handleSend };
