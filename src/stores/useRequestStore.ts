import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  useTableManager,
  type KeyValuePair,
} from "@/composables/useTableManager";

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://lighthttp.samhacker.xyz/new");

  // 基礎資料
  const params = ref<KeyValuePair[]>([]);
  const headers = ref<KeyValuePair[]>([]);

  // 1. 定義同步邏輯
  const syncUrlFromParams = () => {
    try {
      const urlObj = new URL(url.value);
      urlObj.search = "";
      params.value.forEach((p) => {
        if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value);
      });
      url.value = urlObj.toString();
    } catch {}
  };

  // 2. 使用 Composables 管理資料 (傳入 ref 與 回調)
  const paramManager = useTableManager(params, syncUrlFromParams);
  const headerManager = useTableManager(headers); // Header 變動通常不需改 URL

  // 3. 監聽 URL 變動 (解析 Params)
  watch(
    url,
    (newUrl) => {
      try {
        const urlObj = new URL(newUrl);
        const disabledItems = params.value.filter((p) => !p.enabled);
        const newItems: KeyValuePair[] = [];

        urlObj.searchParams.forEach((value, key) => {
          newItems.push({ id: crypto.randomUUID(), enabled: true, key, value });
        });

        params.value = [...disabledItems, ...newItems];
      } catch {}
    },
    { immediate: true },
  );

  return {
    method,
    url,
    params,
    headers,
    // 將 Manager 的方法展開或重新命名導出
    addParam: () => paramManager.add("param"),
    removeParam: paramManager.remove,
    toggleParam: paramManager.toggle,

    addHeader: () => headerManager.add("header", ""),
    removeHeader: headerManager.remove,
    toggleHeader: headerManager.toggle,
  };
});
