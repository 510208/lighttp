import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface QueryParam {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
}

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://lighthttp.samhacker.xyz/new");
  const params = ref<QueryParam[]>([]);

  watch(
    url,
    (newUrl) => {
      try {
        const urlObj = new URL(newUrl);
        const urlSearchParams = urlObj.searchParams;

        // 1. 先標記目前所有「已勾選」的為「待刪除」，準備重新從 URL 讀取
        // 但保留「未勾選」的項目，因為它們不在 URL 裡
        const disabledItems = params.value.filter((p) => !p.enabled);
        const updatedParams: QueryParam[] = [...disabledItems];

        // 2. 從 URL 讀取目前有效的參數
        urlSearchParams.forEach((value, key) => {
          updatedParams.push({
            id: crypto.randomUUID(),
            enabled: true,
            key,
            value,
          });
        });

        params.value = updatedParams;
      } catch (e) {
        // 格式錯誤不更新
      }
    },
    { immediate: true },
  );

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

    // 在params裡新增一筆，並更新URL
    params.value.push({
      id: crypto.randomUUID(),
      enabled: true,
      key,
      value,
    });

    updateUrlFromParams();
  }

  function removeParam(key: string) {
    // 從params裡移除，並更新URL
    params.value = params.value.filter((p) => p.key !== key);

    updateUrlFromParams();
  }

  function toggleParam(id: string) {
    const item = params.value.find((p) => p.id === id);
    if (!item) return;

    item.enabled = !item.enabled;
    updateUrlFromParams();
  }

  // 根據目前的 params 重新組裝 URL
  function updateUrlFromParams() {
    try {
      const urlObj = new URL(url.value);
      urlObj.search = ""; // 清空原本的 query

      params.value.forEach((p) => {
        if (p.enabled && p.key) {
          urlObj.searchParams.append(p.key, p.value);
        }
      });

      url.value = urlObj.toString();
    } catch (e) {
      console.error("URL 更新失敗");
    }
  }

  return { method, url, params, setUrl, addParam, removeParam, toggleParam };
});
