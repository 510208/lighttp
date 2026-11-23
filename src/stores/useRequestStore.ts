import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useWorkspaceStore } from "./useWorkspaceStore";
import { restoreWorkspace } from "@/services/workspace/persistence";
import type { FormDataField, RequestState } from "@/types/workspace";
import {
  useTableManager,
  type KeyValuePair,
} from "@/composables/useTableManager";

import type { AuthStore, AuthStoreForBackend } from "./authType.d";
import type { ProxyConfig } from "./proxyConfig.d";

// 引入 Zod Schema 與型別
import {
  WorkspaceSchema,
  type WorkspaceData,
  type ProxyConfigData,
} from "@/schemas/workspace";

export const useRequestStore = defineStore("request", () => {
  const workspace = useWorkspaceStore();
  const requests = ref<Record<string, RequestState>>({});

  function createRequest(): RequestState {
    return {
      method: "GET",
      url: "https://api.samhacker.xyz",
      params: [],
      headers: [],
      cookieIds: [],
      auth: { type: "none", content: {} },
      bodyType: "None",
      bodyContent: "",
      formData: [],
      urlEncoded: [],
      bodyFilePath: null,
      proxyConfig: {
        enabled: false,
        checkBeforeSend: false,
        protocol: "https",
        host: "",
        port: 0,
      },
    };
  }

  function fromDraft(data: WorkspaceData): RequestState {
    const pairs = (items: WorkspaceData["params"]): KeyValuePair[] =>
      items.map((item) => ({ ...item, id: item.id || crypto.randomUUID() }));
    return {
      method: data.method,
      url: data.url,
      params: pairs(data.params),
      headers: pairs(data.headers),
      cookieIds: [...data.cookieIds],
      auth: { type: data.auth.auth_type, content: data.auth.content ?? {} },
      bodyType: data.body.type,
      bodyContent: data.body.content,
      formData: data.body.formData.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      })),
      urlEncoded: pairs(data.body.urlEncoded),
      bodyFilePath: data.body.filePath,
      proxyConfig: data.proxy
        ? {
            ...data.proxy,
            protocol: data.proxy.protocol as ProxyConfig["protocol"],
            auth: data.proxy.auth ?? undefined,
          }
        : createRequest().proxyConfig,
    };
  }

  const restored = restoreWorkspace();
  for (const tab of workspace.tabs) {
    const draft = restored?.requests[tab.id];
    requests.value[tab.id] = draft ? fromDraft(draft) : createRequest();
  }

  const emptyRequest = createRequest();
  const activeRequest = computed(() =>
    workspace.activeTabId
      ? (requests.value[workspace.activeTabId] ?? emptyRequest)
      : emptyRequest,
  );
  function field<K extends keyof RequestState>(key: K) {
    return computed({
      get: () => activeRequest.value[key],
      set: (value: RequestState[K]) => {
        if (workspace.activeTabId && requests.value[workspace.activeTabId]) {
          requests.value[workspace.activeTabId][key] = value;
        }
      },
    });
  }

  const method = field("method");
  const url = field("url");
  const params = field("params");
  const headers = field("headers");
  const cookieIds = field("cookieIds");
  const auth = field("auth");
  const bodyType = field("bodyType");
  const bodyContent = field("bodyContent");
  const formData = field("formData");
  const urlEncoded = field("urlEncoded");
  const bodyFilePath = field("bodyFilePath");
  const proxyConfig = field("proxyConfig");

  function setAuth(newAuth: AuthStore) {
    auth.value = newAuth;
  }
  function setBodyType(type: string) {
    bodyType.value = type;
  }
  function setBodyContent(content: string) {
    bodyContent.value = content;
  }
  function setProxyConfig(config: ProxyConfig) {
    proxyConfig.value = config;
  }

  function initializeRequest(tabId: string) {
    if (!requests.value[tabId]) requests.value[tabId] = createRequest();
  }
  function deleteRequest(tabId: string) {
    delete requests.value[tabId];
  }
  function getRequest(tabId: string) {
    return requests.value[tabId];
  }
  function updateRequest(tabId: string, updates: Partial<RequestState>) {
    if (requests.value[tabId]) Object.assign(requests.value[tabId], updates);
  }

  watch(
    activeRequest,
    (value, previous) => {
      if (value === previous && workspace.activeTabId)
        workspace.touchTab(workspace.activeTabId);
    },
    { deep: true },
  );

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
  const urlEncodedManager = useTableManager(urlEncoded);

  function addFormData() {
    formData.value.push({
      id: crypto.randomUUID(),
      enabled: true,
      key: "",
      value: "",
      type: "text",
      filePath: null,
    });
  }

  function updateFormData(
    id: string,
    updates: Partial<Omit<FormDataField, "id">>,
  ) {
    const item = formData.value.find((item) => item.id === id);
    if (item) Object.assign(item, updates);
  }

  function removeFormData(id: string) {
    formData.value = formData.value.filter((item) => item.id !== id);
  }

  // Activating a draft must never rewrite its parameters.
  watch(
    () => [workspace.activeTabId, url.value] as const,
    ([tabId, newUrl], [previousTabId]) => {
      if (!tabId || tabId !== previousTabId) return;
      try {
        const searchParams = new URL(newUrl).searchParams;
        const current = new URLSearchParams();
        params.value
          .filter((p) => p.enabled && p.key)
          .forEach((p) => current.append(p.key, p.value));
        if (current.toString() === searchParams.toString()) return;
        const disabledItems = params.value.filter((p) => !p.enabled);
        const newItems: KeyValuePair[] = [];
        searchParams.forEach((value, key) =>
          newItems.push({
            id: crypto.randomUUID(),
            enabled: true,
            key,
            value,
          }),
        );
        params.value = [...disabledItems, ...newItems];
      } catch {
        // Keep unfinished URLs editable.
      }
    },
    { flush: "sync" },
  );

  function renameAuthType(original: AuthStore): AuthStoreForBackend {
    return {
      auth_type: original.type,
      content: original.content,
    };
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
      cookieIds: cookieIds.value,
      auth: renameAuthType(auth.value),
      body: {
        type: bodyType.value,
        content: bodyContent.value,
        formData: formData.value,
        urlEncoded: urlEncoded.value,
        filePath: bodyFilePath.value,
      },
      proxy: checkedProxyConfig,
    });
  }

  function getRequestDraft(tabId: string): WorkspaceData {
    const request = requests.value[tabId];
    if (!request) throw new Error("Request tab no longer exists.");
    return {
      url: request.url,
      method: request.method,
      params: request.params,
      headers: request.headers,
      cookieIds: request.cookieIds,
      auth: renameAuthType(request.auth),
      body: {
        type: request.bodyType,
        content: request.bodyContent,
        formData: request.formData,
        urlEncoded: request.urlEncoded,
        filePath: request.bodyFilePath,
      },
      proxy: { ...request.proxyConfig, auth: request.proxyConfig.auth ?? null },
    };
  }

  function loadRequestData(data: WorkspaceData, tabId = workspace.activeTabId) {
    const targetId = tabId ?? workspace.createTab();
    requests.value[targetId] = fromDraft(data);
    workspace.touchTab(targetId);
  }

  return {
    requests,
    initializeRequest,
    deleteRequest,
    getRequest,
    updateRequest,
    getRequestDraft,
    method,
    url,
    params,
    auth,
    headers,
    cookieIds,

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
    formData,
    addFormData,
    updateFormData,
    removeFormData,
    urlEncoded,
    addUrlEncoded: () => urlEncodedManager.add("", ""),
    updateUrlEncoded: urlEncodedManager.update,
    removeUrlEncoded: urlEncodedManager.remove,
    toggleUrlEncoded: urlEncodedManager.toggle,
    bodyFilePath,

    proxyConfig,
    setProxyConfig,

    getRequestData,
    loadRequestData,
  };
});

// 導出 Store 實例與資料型別
export type RequestStoreData = ReturnType<typeof useRequestStore>;
export type { WorkspaceData };
