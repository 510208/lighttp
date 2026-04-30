type HeaderTemplate = {
  key: string;
  value: string;
  description: string;
};

const headerTemplates: HeaderTemplate[] = [
  {
    key: "Content-Type",
    value: "application/json",
    description:
      "告訴伺服器請求主體的媒體類型，常見的值包括 application/json（表示請求主體是 JSON 格式）、application/x-www-form-urlencoded（表示請求主體是 URL 編碼格式）等。\n根據請求內容的格式選擇適當的 Content-Type，可以確保伺服器正確解析請求數據。",
  },
  {
    key: "User-Agent",
    value: "LigHTTP/1.0.0",
    description:
      "標識發出請求的瀏覽器類型、作業系統等，常被爬蟲用於模擬真人瀏覽。\n如果需要模擬特定瀏覽器，可以將此值設置為該瀏覽器的 User-Agent 字串。",
  },
  {
    key: "Accept-Language",
    value: "zh-TW,zh;q=0.9,en;q=0.8",
    description:
      "告知伺服器用戶端偏好的語言內容。\n使用者可用半形分號（;）分隔多個語言選項，並使用 q 參數指定每個語言的優先級（q 值越高優先級越高）。",
  },
  {
    key: "Cache-Control",
    value: "no-cache",
    description:
      "控制快取機制，要求伺服器重新驗證資源。\n常見的值包括 no-cache（不使用快取，直接向伺服器請求最新資源）、no-store（完全不使用快取，連同請求和回應都不被快取）等。",
  },
];

export default headerTemplates;
export { headerTemplates };
export type { HeaderTemplate };
