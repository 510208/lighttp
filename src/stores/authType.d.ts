import { type AuthMethod } from "@/constants/methods";

interface AuthStore {
  type: AuthMethod;
  content: NoneAuthContent | BasicAuthContent | BearerAuthContent; // 根據 type 決定內容結構
}

interface AuthStoreForBackend {
  auth_type: AuthMethod; // 後端使用 snake_case
  content: NoneAuthContent | BasicAuthContent | BearerAuthContent;
}

interface NoneAuthContent {
  // 無認證通常不需要額外內容，但可以保留這個接口以便未來擴展
}

interface BearerAuthContent {
  token: string;
}

interface BasicAuthContent {
  username: string;
  password: string;
}

export type {
  AuthStore,
  AuthStoreForBackend,
  NoneAuthContent,
  BasicAuthContent,
  BearerAuthContent,
};
