import type { RequestStoreData } from "@/stores/useRequestStore";
import type { BasicAuthContent } from "@/stores/authType";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { validateBodyFiles } from "@/lib/requestBody";
import { getCookieHeader } from "@/services/cookies";
import { i18n } from "@/i18n";

function getIndentString(defaultIndentSize: number | string): string {
  const store = useSettingsStore();
  return (
    store.getQuicktypeIndentString() || defaultIndentSize.toString() || "  "
  );
}

function escapeShellArg(value: string, powershell: boolean): string {
  // PowerShell 以重複單引號跳脫；Bash 則先結束引號再插入單引號。
  const escaped = powershell
    ? value.split("'").join("''")
    : value.split("'").join("'\\''");
  return `'${escaped}'`;
}

function escapeFormFilePath(path: string): string {
  // cURL 會另外解析逗號及分號，檔案路徑必須先做 multipart 引號跳脫。
  const escaped = path.split("\\").join("\\\\").split('"').join('\\"');
  return `"${escaped}"`;
}

export async function getCurlCommand(
  store: RequestStoreData,
  indentString: string | number,
  breakLineSymbol: string = "\\",
): Promise<string> {
  validateBodyFiles(store);
  const cookieIds = [...store.cookieIds];
  const rawUrl = store.url.trim();
  const lowerUrl = rawUrl.toLowerCase();
  const cookieUrl =
    lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://")
      ? rawUrl
      : `http://${rawUrl}`;
  if (
    cookieIds.length &&
    store.headers.some(
      (header) => header.enabled && header.key.toLowerCase() === "cookie",
    )
  ) {
    throw new Error(i18n.global.t("cookies.header_conflict"));
  }
  const parts: string[] = [];
  const indent = getIndentString(indentString);
  const powershell = breakLineSymbol === "`";
  const quote = (value: string) => escapeShellArg(value, powershell);
  const executable = powershell ? "curl.exe" : "curl";
  const multipart = store.bodyType === "Form Data";
  parts.push(
    `${executable} -X ${quote(store.method.toUpperCase())} ${quote(store.url)}`,
  );

  const headers = store.headers.filter((header) => {
    if (!header.enabled || !header.key) return false;
    const name = header.key.toLowerCase();
    return !multipart || (name !== "content-type" && name !== "content-length");
  });
  for (const header of headers) {
    parts.push(`${indent}-H ${quote(`${header.key}: ${header.value}`)}`);
  }
  const hasContentType = headers.some(
    (header) => header.key.toLowerCase() === "content-type",
  );

  if (store.auth.type === "basic" && store.auth.content) {
    const auth = store.auth.content as BasicAuthContent;
    parts.push(`${indent}-u ${quote(`${auth.username}:${auth.password}`)}`);
  } else if (store.auth.type === "bearer" && store.auth.content) {
    const token = (store.auth.content as { token: string }).token;
    parts.push(`${indent}-H ${quote(`Authorization: Bearer ${token}`)}`);
  }

  switch (store.bodyType) {
    case "Raw":
      if (store.bodyContent) {
        parts.push(`${indent}-d ${quote(store.bodyContent)}`);
      }
      break;
    case "Form Data": {
      const fields = store.formData.filter(
        (field) => field.enabled && field.key,
      );
      for (const field of fields) {
        if (field.type === "file") {
          const file = escapeFormFilePath(field.filePath!);
          parts.push(`${indent}--form ${quote(`${field.key}=@${file}`)}`);
        } else {
          parts.push(
            `${indent}--form-string ${quote(`${field.key}=${field.value}`)}`,
          );
        }
      }
      if (fields.length === 0) {
        parts.push(
          `${indent}-H ${quote("Content-Type: multipart/form-data; boundary=LigHTTPBoundary")}`,
          `${indent}--data-raw ${quote("")}`,
        );
      }
      break;
    }
    case "URL Encoded": {
      const fields = new URLSearchParams();
      for (const field of store.urlEncoded) {
        if (field.enabled && field.key) fields.append(field.key, field.value);
      }
      if (!hasContentType) {
        parts.push(
          `${indent}-H ${quote("Content-Type: application/x-www-form-urlencoded")}`,
        );
      }
      parts.push(`${indent}--data-raw ${quote(fields.toString())}`);
      break;
    }
    case "Binary":
      if (!hasContentType) {
        parts.push(
          `${indent}-H ${quote("Content-Type: application/octet-stream")}`,
        );
      }
      parts.push(`${indent}--data-binary ${quote(`@${store.bodyFilePath}`)}`);
      break;
  }

  if (
    store.proxyConfig?.enabled &&
    store.proxyConfig.host &&
    store.proxyConfig.port
  ) {
    const proxy = store.proxyConfig;
    const auth = proxy.auth
      ? `${proxy.auth.username}:${proxy.auth.password}@`
      : "";
    const url = `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
    parts.push(`${indent}-x ${quote(url)}`);
  }

  if (cookieIds.length) {
    const cookieHeader = await getCookieHeader(cookieIds, cookieUrl);
    if (cookieHeader) {
      parts.push(`${indent}-H ${quote(`Cookie: ${cookieHeader}`)}`);
    }
  }
  return parts.join(` ${breakLineSymbol}\n`);
}
