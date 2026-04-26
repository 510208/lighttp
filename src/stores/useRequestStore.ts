import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://lighthttp.samhacker.xyz/new");

  // 定義params，根據method和url動態生成請求參數
  const params = computed(() => {
    try {
      const searchParams = new URL(url.value).searchParams;
      const result = [];
      for (const [key, value] of searchParams.entries()) {
        result.push({
          id: `${key}-${value}-${Math.random()}`, // 暫時產生 key 作為渲染使用
          key,
          value,
        });
      }
      return result;
    } catch {
      return [];
    }
  });

  // 未來可以在這裡加入發送請求的邏輯
  function setUrl(newUrl: string) {
    url.value = newUrl;
  }

  // 新增params參數
  function addParam(key: string, value: string) {
    // 在URL尾端更新
    const urlObj = new URL(url.value);
    urlObj.searchParams.append(key, value);
    url.value = urlObj.toString();
  }

  return { method, url, params, setUrl, addParam };
});
