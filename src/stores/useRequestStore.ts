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
  watch(url, (newUrl, oldUrl) => {
    // 關鍵：如果 URL 的變化是由於表格內部 updateUrlFromParams 觸發的，就跳過
    // 這裡可以檢查新的 URL 解析出的 Query 是否跟目前的 params 一致
    try {
      const urlObj = new URL(newUrl);
      const searchParams = urlObj.searchParams;

      // 將 URL 的參數轉為字串比較，簡單判斷是否真的有外部變動
      const currentParamsStr = params.value
        .filter((p) => p.enabled)
        .map((p) => `${p.key}=${p.value}`)
        .join("&");
      const newParamsStr = searchParams.toString();

      // 如果內部的 params 跟 URL 已經同步了，就不要重新賦值，避免觸發重新渲染
      if (currentParamsStr === newParamsStr && params.value.length > 0) {
        return;
      }

      const disabledItems = params.value.filter((p) => !p.enabled);
      const newItems: KeyValuePair[] = [];

      searchParams.forEach((value, key) => {
        newItems.push({
          id: crypto.randomUUID(),
          enabled: true,
          key,
          value,
        });
      });

      params.value = [...disabledItems, ...newItems];
    } catch (e) {
      // 格式錯誤不處理
    }
  });

  return {
    method,
    url,
    params,
    headers,
    // 將 Manager 的方法展開或重新命名導出
    addParam: () => paramManager.addExample("param"),
    addParamFromPair: (key: string, value: string) =>
      paramManager.add(key, value),
    removeParam: paramManager.remove,
    toggleParam: paramManager.toggle,
    updateParam: paramManager.update,

    addHeader: () => headerManager.addExample("header", ""),
    addHeaderFromPair: (key: string, value: string) =>
      headerManager.add(key, value),
    removeHeader: headerManager.remove,
    toggleHeader: headerManager.toggle,
    updateHeader: headerManager.update,
  };
});
