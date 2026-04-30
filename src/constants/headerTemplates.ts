type HeaderTemplate = {
  key: string;
  value: string;
  description: string;
};

const headerTemplates: HeaderTemplate[] = [
  {
    key: "Accept",
    value: "application/json, text/plain, */*",
    description:
      "告知伺服器用戶端能夠處理的媒體類型（MIME types）。伺服器將根據此欄位進行內容協商（Content Negotiation），回傳最合適的格式。",
  },
  {
    key: "Accept-Encoding",
    value: "gzip, deflate, br",
    description:
      "告知伺服器用戶端支援的內容壓縮演算法。透過 gzip 或 Brotli (br) 壓縮傳輸數據，可顯著提升網頁載入速度。",
  },
  {
    key: "Accept-Language",
    value: "zh-TW,zh;q=0.9,en;q=0.8",
    description:
      "告知伺服器用戶端偏好的語言內容。\n使用者可用半形分號（;）分隔多個語言選項，並使用 q 參數指定每個語言的優先級（q 值越高優先級越高）。",
  },
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
    description:
      "屬於回應標頭（Response Header），指定哪些網域可以存取該資源。在處理前端跨域問題時，此欄位的配置至關重要。",
  },
  {
    key: "Authorization",
    value: "Bearer <token>",
    description:
      "用於向伺服器證明發送請求的使用者身份。常見格式包含 Basic Auth（Base64 編碼）或 Bearer Token（如 JWT）。這是實現 API 安全驗證的核心欄位。",
  },
  {
    key: "Cache-Control",
    value: "no-cache",
    description:
      "控制快取機制，要求伺服器重新驗證資源。\n常見的值包括 no-cache（不使用快取，直接向伺服器請求最新資源）、no-store（完全不使用快取，連同請求和回應都不被快取）等。",
  },
  {
    key: "Connection",
    value: "keep-alive",
    description:
      "決定當前網路連線在傳輸完成後是否關閉。keep-alive 允許在同一個 TCP 連線上發送多個請求，能有效減少連線建立的延遲（Latency）。",
  },
  {
    key: "Content-Length",
    value: "1024",
    description:
      "表示請求或回應主體的大小（以位元組為單位）。伺服器利用此資訊判斷封包是否接收完整。",
  },
  {
    key: "Content-Type",
    value: "application/json",
    description:
      "告訴伺服器請求主體的媒體類型，常見的值包括 application/json（表示請求主體是 JSON 格式）、application/x-www-form-urlencoded（表示請求主體是 URL 編碼格式）等。\n根據請求內容的格式選擇適當的 Content-Type，可以確保伺服器正確解析請求數據。",
  },
  {
    key: "Cookie",
    value: "sessionid=xyz123; theme=dark",
    description:
      "由用戶端傳送至伺服器的狀態資訊，通常包含 Session ID 或使用者偏好。伺服器透過此欄位辨識不同請求是否來自同一個瀏覽器。",
  },
  {
    key: "DNT",
    value: "1",
    description:
      "全稱為 'Do Not Track'。告知伺服器使用者不希望被追蹤其瀏覽行為。雖然並非所有伺服器都會遵守，但這是保護隱私的重要機制。",
  },
  {
    key: "Expect",
    value: "100-continue",
    description:
      "用戶端在發送大型主體（如上傳檔案）前，先詢問伺服器是否願意接收。伺服器若同意則回傳 100 狀態碼，避免浪費資源傳送被拒絕的數據。",
  },
  {
    key: "Host",
    value: "api.example.com",
    description:
      "指定伺服器的域名與連接埠號。在虛擬主機（Virtual Hosting）環境中，伺服器依據此欄位判斷應由哪個網站處理該請求。在 HTTP/1.1 中此欄位為必填。",
  },
  {
    key: "If-Modified-Since",
    value: "Wed, 21 Oct 2025 07:28:00 GMT",
    description:
      "僅當資源在指定時間後有修改時，伺服器才回傳完整內容。這是實現 HTTP 快取驗證（Validation）的另一種常用手段。",
  },
  {
    key: "If-None-Match",
    value: '"e-tag-value"',
    description:
      "條件式請求標頭。配合伺服器的 ETag 使用，若資源未變更，伺服器將回傳 304 Not Modified，能大幅節省頻寬與載入時間。",
  },
  {
    key: "Origin",
    value: "https://example.com",
    description:
      "標示請求發起的來源域名，但不包含路徑。主要用於跨來源資源共享（CORS）請求，伺服器依此判斷是否允許該來源進行存取。",
  },
  {
    key: "Pragma",
    value: "no-cache",
    description:
      "HTTP/1.0 時代留下的過渡性欄位，作用與 Cache-Control: no-cache 類似。主要用於向下相容舊版實作。",
  },
  {
    key: "Referer",
    value: "https://example.com/page",
    description:
      "包含當前請求來源頁面的絕對路徑。常用於日誌分析、快取優化或防盜鏈設定。請注意，此單字在 HTTP 規範中拼寫為少一個 'r' 的錯誤格式（非 Referrer）。",
  },
  {
    key: "Sec-Fetch-Mode",
    value: "cors",
    description:
      "由瀏覽器自動設置，用於說明請求的模式（如 cors、navigate、no-cors）。伺服器可利用此欄位加強安全策略防禦，防止跨站請求偽造（CSRF）。",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
    description:
      "簡稱 HSTS。告知瀏覽器在指定時間內只能透過 HTTPS 存取該網站，能有效防止中間人攻擊（MITM）與 SSL 剝離攻擊。",
  },
  {
    key: "Upgrade-Insecure-Requests",
    value: "1",
    description:
      "告知伺服器使用者偏好加密連線，並希望將所有的 HTTP 請求自動升級為 HTTPS 請求。",
  },
  {
    key: "User-Agent",
    value: "LigHTTP/1.0.0",
    description:
      "標識發出請求的瀏覽器類型、作業系統等，常被爬蟲用於模擬真人瀏覽。\n如果需要模擬特定瀏覽器，可以將此值設置為該瀏覽器的 User-Agent 字串。",
  },
  {
    key: "X-Forwarded-For",
    value: "203.0.113.195",
    description:
      "標準的代理伺服器（Proxy）或負載平衡器（Load Balancer）轉發標頭，用來標識發起請求的原始用戶端 IP 地址。",
  },
  {
    key: "X-Requested-With",
    value: "XMLHttpRequest",
    description:
      "主要用於標識請求是由 Ajax（Asynchronous JavaScript and XML）發出的。許多 Web 框架利用此欄位來區分標準的瀏覽器導向與異步 API 調用。",
  },
];

export default headerTemplates;
export { headerTemplates };
export type { HeaderTemplate };
