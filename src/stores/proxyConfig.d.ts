export interface ProxyConfig {
  enabled: boolean;
  checkBeforeSend: boolean; // 是否在發送請求前檢查代理設定
  protocol: "http" | "https" | "socks4" | "socks5"; // e.g., "http", "https", "socks4", "socks5"
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}
