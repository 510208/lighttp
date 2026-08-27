import { type RequestStoreData } from "@/stores/useRequestStore";
import { BasicAuthContent } from "@/stores/authType";
import { useSettingsStore } from "@/stores/useSettingsStore";

// 監聽 settingsStore 中的 defaultIndentSize 設定，並變動 indentString 裡的空白長度
function getIndentString(defaultIndentSize: number | string): string {
  const store = useSettingsStore();
  return (
    store.getQuicktypeIndentString() || defaultIndentSize.toString() || "  "
  );
}

// 安全轉義 POSIX/Bash Shell 參數
function escapeShellArg(arg: string): string {
  // 1. 移除危險的換行符號，避免 Terminal 貼上時自動換行執行
  const sanitized = arg.replace(/[\r\n]+/g, "");

  // 2. 在單引號包裹的 Bash 字串中，將 ' 替換為 '\''
  return `'${sanitized.replace(/'/g, "'\\''")}'`;
}

// 專門用於處理多行 Body（如 JSON / XML）的轉義
function escapeShellBody(body: string): string {
  // Body 允許保留換行，但單引號必須進行嚴格轉義
  return `'${body.replace(/'/g, "'\\''")}'`;
}

export function getCurlCommand(
  store: RequestStoreData,
  indentString: string | number,
  breakLineSymbol: string = "\\",
): string {
  const parts: string[] = [];
  const indent = getIndentString(indentString);

  // 基礎 URL 轉義
  const safeUrl = escapeShellArg(store.url);
  const safeMethod = escapeShellArg(store.method.toUpperCase());
  parts.push(`curl -X ${safeMethod} ${safeUrl}`);

  // Headers
  store.headers.forEach((header) => {
    if (header.enabled && header.key) {
      const headerString = `${header.key}: ${header.value}`;
      parts.push(`${indent}-H ${escapeShellArg(headerString)}`);
    }
  });

  // Auth
  if (store.auth.type === "basic" && store.auth.content) {
    const authContent = store.auth.content as BasicAuthContent;
    const userPass = `${authContent.username}:${authContent.password}`;
    parts.push(`${indent}-u ${escapeShellArg(userPass)}`);
  } else if (store.auth.type === "bearer token" && store.auth.content) {
    const token = (store.auth.content as { token: string }).token;
    const authHeader = `Authorization: Bearer ${token}`;
    parts.push(`${indent}-H ${escapeShellArg(authHeader)}`);
  }

  // Body
  if (store.bodyContent && store.bodyType !== "None") {
    parts.push(`${indent}-d ${escapeShellBody(store.bodyContent)}`);
  }

  // Proxy
  if (store.proxyConfig && store.proxyConfig.host && store.proxyConfig.port) {
    const authPart = store.proxyConfig.auth
      ? `${store.proxyConfig.auth.username}:${store.proxyConfig.auth.password}@`
      : "";
    const proxyUrl = `${store.proxyConfig.protocol}://${authPart}${store.proxyConfig.host}:${store.proxyConfig.port}`;
    parts.push(`${indent}-x ${escapeShellArg(proxyUrl)}`);
  }

  return parts.join(` ${breakLineSymbol}\n`);
}
