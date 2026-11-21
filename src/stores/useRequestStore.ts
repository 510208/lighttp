import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  useTableManager,
  type KeyValuePair,
} from "@/composables/useTableManager";

import type { AuthStore, AuthStoreForBackend } from "./authType.d";
import type { ProxyConfig } from "./proxyConfig.d";
import { getVersion } from "@tauri-apps/api/app";

// 引入 Zod Schema 與型別
import {
  WorkspaceSchema,
  type WorkspaceData,
  // type KeyValuePairData,
  type ProxyConfigData,
} from "@/schemas/workspace";

export const useRequestStore = defineStore("request", () => {
  const method = ref("GET");
  const url = ref("https://api.samhacker.xyz");

  // 基礎資料
  const params = ref<KeyValuePair[]>([]);
  const headers = ref<KeyValuePair[]>([
    {
      id: crypto.randomUUID(),
      enabled: true,
      key: "Content-Type",
      value: "application/json",
    },
    {
      id: crypto.randomUUID(),
      enabled: true,
      key: "User-Agent",
      value: "LigHTTP/0.6.1", // 預設值，由 async 初始化替換
    },
  ]);

  // 系統 User-Agent 初始化
  async function initUserAgent() {
    try {
      const version = await getVersion();
      const uaIndex = headers.value.findIndex((h) => h.key === "User-Agent");
      if (uaIndex !== -1) {
        headers.value[uaIndex].value = `LigHTTP/${version}`;
      }
    } catch {
      // 靜默處理非 Tauri 環境下的初始化失敗
    }
  }
  initUserAgent();

  // 認證資料
  const auth = ref<AuthStore>({
    type: "none",
    content: {},
  });

  function setAuth(newAuth: AuthStore) {
    auth.value = newAuth;
  }

  // URL 與 Params 同步邏輯
  const syncUrlFromParams = () => {
    try {
      const urlObj = new URL(url.value);
      urlObj.search = "";
      params.value.forEach((p) => {
        if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value);
      });
      url.value = urlObj.toString();
    } catch {
      // 格式錯誤忽略
    }
  };

  const paramManager = useTableManager(params, syncUrlFromParams);
  const headerManager = useTableManager(headers);

  // 監聽 URL 變動
  watch(url, (newUrl) => {
    try {
      const urlObj = new URL(newUrl);
      const searchParams = urlObj.searchParams;

      const currentParamsStr = params.value
        .filter((p) => p.enabled)
        .map((p) => `${p.key}=${p.value}`)
        .join("&");
      const newParamsStr = searchParams.toString();

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
    } catch {
      // 格式錯誤忽略
    }
  });

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
    checkBeforeSend: false,
    protocol: "http",
    host: "",
    port: 0,
  });

  function setProxyConfig(config: ProxyConfig) {
    proxyConfig.value = config;
  }

  // 匯出JSON資料
  function getRequestData(): WorkspaceData {
    let checkedProxyConfig: ProxyConfigData | null = proxyConfig.value.enabled
      ? {
          enabled: proxyConfig.value.enabled,
          checkBeforeSend: proxyConfig.value.checkBeforeSend,
          protocol: proxyConfig.value.protocol,
          host: proxyConfig.value.host,
          port: proxyConfig.value.port,
          auth: proxyConfig.value.auth
            ? {
                username: proxyConfig.value.auth.username,
                password: proxyConfig.value.auth.password,
              }
            : null,
        }
      : null;

    if (proxyConfig.value.enabled) {
      const proxyPort = Number(proxyConfig.value.port);

      if (
        !proxyConfig.value.host.trim() ||
        !Number.isInteger(proxyPort) ||
        proxyPort < 1 ||
        proxyPort > 65535 ||
        !proxyConfig.value.protocol
      ) {
        throw new Error(
          "Proxy is enabled but host, protocol, or port is invalid.",
        );
      }

      if (
        proxyConfig.value.auth &&
        (!proxyConfig.value.auth.username || !proxyConfig.value.auth.password)
      ) {
        console.error(
          "Proxy auth is enabled but username or password is missing.",
        );
        if (checkedProxyConfig) {
          checkedProxyConfig.auth = null;
        }
      }
    }

    return WorkspaceSchema.parse({
      url: url.value,
      method: method.value,
      params: params.value.filter((p) => p.enabled),
      headers: headers.value.filter((h) => h.enabled),
      auth: renameAuthType(auth.value),
      body: {
        type: bodyType.value,
        content: bodyContent.value,
      },
      proxy: checkedProxyConfig,
    });
  }

  // 接收經由 Zod 驗證完畢的 WorkspaceData 進行狀態更新
  function loadRequestData(data: WorkspaceData) {
    url.value = data.url;
    method.value = data.method;

    params.value = data.params.map((p: any) => ({
      id: p.id || crypto.randomUUID(),
      enabled: p.enabled,
      key: p.key,
      value: p.value,
    }));

    headers.value = data.headers.map((h: any) => ({
      id: h.id || crypto.randomUUID(),
      enabled: h.enabled,
      key: h.key,
      value: h.value,
    }));

    auth.value = {
      type: data.auth.auth_type,
      content: data.auth.content,
    };

    bodyType.value = data.body.type;
    bodyContent.value = data.body.content;

    if (data.proxy && data.proxy.enabled) {
      proxyConfig.value = {
        enabled: true,
        checkBeforeSend: data.proxy.checkBeforeSend,
        protocol: data.proxy.protocol as "http" | "https" | "socks4" | "socks5",
        host: data.proxy.host,
        port: data.proxy.port,
        auth: data.proxy.auth
          ? {
              username: data.proxy.auth.username,
              password: data.proxy.auth.password,
            }
          : undefined,
      };
    } else {
      proxyConfig.value = {
        enabled: false,
        checkBeforeSend: false,
        protocol: "http",
        host: "",
        port: 0,
      };
    }
  }

  return {
    method,
    url,
    params,
    auth,
    headers,

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

    setAuth,

    bodyType,
    bodyContent,
    setBodyType,
    setBodyContent,

    proxyConfig,
    setProxyConfig,

    getRequestData,
    loadRequestData,
  };
});

// 導出 Store 實例與資料型別
export type RequestStoreData = ReturnType<typeof useRequestStore>;
export type { WorkspaceData };
