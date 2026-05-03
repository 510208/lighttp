export interface ProxyConfig {
  enabled: boolean;
  protocol: "http" | "https" | "socks4" | "socks5"; // e.g., "http", "https", "socks4", "socks5"
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}
