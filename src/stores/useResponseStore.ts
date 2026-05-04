import { defineStore } from "pinia";
import { ref } from "vue";

export interface ResponseState {
  status: number | null;
  body: string;
  headers: Record<string, string>;
  timeTaken: number | null;
}

export const useResponseStore = defineStore("response", () => {
  const status = ref<number | null>(null);
  const body = ref<string>("");
  const headers = ref<Record<string, string>>({});

  const timeTaken = ref<number | null>(null);

  function setResponse(payload: any) {
    try {
      // 檢查 payload 是否為物件，如果是字串則嘗試解析
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
    } catch (e) {
      console.error("[setResponse] Failed to parse response payload:", e);
      status.value = null;
      headers.value = {};
      body.value = "";
      timeTaken.value = null;
    }
  }
  return {
    status,
    headers,
    body,
    timeTaken,

    setResponse,
  };
});
