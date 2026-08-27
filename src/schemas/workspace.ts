import { z } from "zod";

// 鍵值對（Headers / Params）
export const KeyValuePairSchema = z.object({
  id: z.string().optional(),
  enabled: z.boolean().default(true),
  key: z.string().default(""),
  value: z.string().default(""),
});

// Proxy 認證資訊
export const ProxyAuthSchema = z.object({
  username: z.string().default(""),
  password: z.string().default(""),
});

// Proxy 設定
export const ProxyConfigSchema = z.object({
  enabled: z.boolean().default(false),
  checkBeforeSend: z.boolean().default(false),
  protocol: z.string().default("http"),
  host: z.string().default(""),
  port: z.number().default(0),
  auth: ProxyAuthSchema.optional().nullable(),
});

// 後端 Backend 格式的 Auth 結構
export const AuthForBackendSchema = z.object({
  auth_type: z.string().default("none"),
  content: z.any().optional(),
});

// 完整 Workspace 請求資料 Schema
export const WorkspaceSchema = z.object({
  url: z.string().default("https://api.samhacker.xyz"),
  method: z.string().default("GET"),
  params: z.array(KeyValuePairSchema).default([]),
  headers: z.array(KeyValuePairSchema).default([]),
  auth: AuthForBackendSchema.default({ auth_type: "none", content: {} }),
  body: z
    .object({
      type: z.string().default("None"),
      content: z.string().default(""),
    })
    .default({ type: "None", content: "" }),
  proxy: ProxyConfigSchema.nullable().default(null),
});

// 匯出 Zod 推導出的型別
export type WorkspaceData = z.infer<typeof WorkspaceSchema>;
export type KeyValuePairData = z.infer<typeof KeyValuePairSchema>;
export type ProxyConfigData = z.infer<typeof ProxyConfigSchema>;
