import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  useTableManager,
  type KeyValuePair,
} from "@/composables/useTableManager";

import type { AuthStore, AuthStoreForBackend } from "./authType.d";
import type { ProxyConfig } from "./proxyConfig.d";

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://lighthttp.samhacker.xyz/new");

  // 基礎資料
  const params = ref<KeyValuePair[]>([]);
  const headers = ref<KeyValuePair[]>([]);

  // 認證資料
  const auth = ref<AuthStore>({
    type: "none",
    content: {},
  });

  function setAuth(newAuth: AuthStore) {
    auth.value = newAuth;
  }

  // Header
  //   定義同步邏輯
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

  // 參數
  const paramManager = useTableManager(params, syncUrlFromParams);

  // Header
  const headerManager = useTableManager(headers); // Header 變動通常不需改 URL

  //  - 監聽 URL 變動 (解析 Params)
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

  // 將auth.type改為auth.auth_type，否則在Rust端無法正確解析
  function renameAuthType(original: AuthStore): AuthStoreForBackend {
    return {
      auth_type: original.type,
      content: original.content,
    };
  }

  // Body
  const bodyType = ref("None");
  const bodyContent = ref("");

  function setBodyType(type: string) {
    bodyType.value = type;
  }

  function setBodyContent(content: string) {
    bodyContent.value = content;
  }

  // Proxy
  const proxyConfig = ref<ProxyConfig>({
    enabled: false,
    protocol: "http",
    host: "",
    port: 0,
  });

  function setProxyConfig(config: ProxyConfig) {
    proxyConfig.value = config;
  }

  // ------

  // 將所儲存的內容組合成json的方法
  function getRequestData() {
    return {
      url: url.value,
      method: method.value,
      params: params.value.filter((p) => p.enabled),
      headers: headers.value.filter((h) => h.enabled),
      auth: renameAuthType(auth.value),
      body: {
        type: bodyType.value,
        content: bodyContent.value,
      },
      proxy: proxyConfig.value,
    };
  }

  // 從JSON或其他來源載入資料的方法
  function loadRequestData(data: ReturnType<typeof getRequestData>) {
    url.value = data.url;
    method.value = data.method;
    params.value = data.params.map((p) => ({ ...p, enabled: true }));
    headers.value = data.headers.map((h) => ({ ...h, enabled: true }));
    auth.value = {
      type: data.auth.auth_type,
      content: data.auth.content,
    };
    bodyType.value = data.body.type;
    bodyContent.value = data.body.content;
    proxyConfig.value = data.proxy;
  }

  return {
    method,
    url,
    params,
    auth,
    headers,

    // 網址參數
    addParam: () => paramManager.addExample("param"),
    addParamFromPair: (key: string, value: string) =>
      paramManager.add(key, value),
    removeParam: paramManager.remove,
    toggleParam: paramManager.toggle,
    updateParam: paramManager.update,

    // Header
    addHeader: () => headerManager.addExample("header", ""),
    addHeaderFromPair: (key: string, value: string) =>
      headerManager.add(key, value),
    removeHeader: headerManager.remove,
    toggleHeader: headerManager.toggle,
    updateHeader: headerManager.update,

    // 認證
    setAuth,

    // Body
    bodyType,
    bodyContent,
    setBodyType,
    setBodyContent,

    // Proxy
    proxyConfig,
    setProxyConfig,

    // 傳送給後端的資訊
    getRequestData,
    loadRequestData,
  };
});
