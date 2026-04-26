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

  // params 管理
  function addParam(key?: string, value?: string) {
    if (!value) value = "value";
    if (!key) {
      // 檢查是否已經有 param 開頭的 key，並找到最大的數字後加1
      const existingKeys = params.value
        .map((param) => param.key)
        .filter((k) => k.startsWith("param"));
      const maxIndex = existingKeys.reduce((max, k) => {
        const index = parseInt(k.replace("param", ""));
        return isNaN(index) ? max : Math.max(max, index);
      }, 0);
      key = `param${maxIndex + 1}`;
    }
    // 在URL尾端更新
    const urlObj = new URL(url.value);
    urlObj.searchParams.append(key, value);
    url.value = urlObj.toString();
  }

  function removeParam(key: string) {
    const urlObj = new URL(url.value);
    urlObj.searchParams.delete(key);
    url.value = urlObj.toString();
  }

  return { method, url, params, setUrl, addParam, removeParam };
});
