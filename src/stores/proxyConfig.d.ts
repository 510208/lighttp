export interface ProxyConfig {
  enabled: boolean;
  protocol: "http" | "https" | "socks5"; // e.g., "http", "https", "socks5"
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}
