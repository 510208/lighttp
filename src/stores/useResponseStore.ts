import { defineStore } from "pinia";
import { ref } from "vue";

export const useResponseStore = defineStore("response", () => {
  const status = ref<number | null>(null);
  const body = ref<string>("");
  const headers = ref<Record<string, string>>({});

  const timeTaken = ref<number | null>(null);

  function setResponse(payload: string) {
    try {
      const responseObj = JSON.parse(payload);
      console.log("Parsed response payload:", responseObj);

      status.value = responseObj.status;
      headers.value = responseObj.headers;
      body.value = responseObj.body;
      timeTaken.value = responseObj.timeTaken;
    } catch (e) {
      console.error("Failed to parse response payload:", e);
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
