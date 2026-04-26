import { defineStore } from "pinia";
import { ref } from "vue";

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://lighthttp.samhacker.xyz/new");

  // 未來可以在這裡加入發送請求的邏輯
  function setUrl(newUrl: string) {
    url.value = newUrl;
  }

  return { method, url, setUrl };
});
