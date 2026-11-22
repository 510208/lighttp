export interface HttpClientConfig {
  timeout: number;
  connectTimeout: number;
  readTimeout: number;
  followRedirects: boolean;
  maxRedirects: number;
  referer: boolean;
  httpsOnly: boolean;
}

export const MAX_TIMEOUT_SECONDS = 86400;
export const MAX_REDIRECTS = 100;

export function createDefaultHttpClientConfig(): HttpClientConfig {
  return {
    timeout: 30,
    connectTimeout: 10,
    readTimeout: 0,
    followRedirects: true,
    maxRedirects: 10,
    referer: true,
    httpsOnly: false,
  };
}

export function normalizeHttpClientConfig(
  value: Partial<HttpClientConfig> | null | undefined,
): HttpClientConfig {
  const config = createDefaultHttpClientConfig();
  if (!value || typeof value !== "object") return config;

  // 舊版設定可能缺少欄位，手動編輯的設定檔也可能含有無效數值。
  for (const key of [
    "timeout",
    "connectTimeout",
    "readTimeout",
    "maxRedirects",
  ] as const) {
    const number = value[key];
    const minimum = key === "maxRedirects" ? 1 : 0;
    const maximum =
      key === "maxRedirects" ? MAX_REDIRECTS : MAX_TIMEOUT_SECONDS;
    if (
      typeof number === "number" &&
      Number.isSafeInteger(number) &&
      number >= minimum &&
      number <= maximum
    ) {
      config[key] = number;
    }
  }

  for (const key of ["followRedirects", "referer", "httpsOnly"] as const) {
    if (typeof value[key] === "boolean") config[key] = value[key];
  }

  return config;
}
