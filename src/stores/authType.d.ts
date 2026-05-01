import { type AuthMethod } from "@/constants/methods";

interface AuthStore {
  type: AuthMethod;
  content: NoneAuthContent | BasicAuthContent; // 根據 type 決定內容結構
}

interface NoneAuthContent {
  // 無認證通常不需要額外內容，但可以保留這個接口以便未來擴展
}

interface BasicAuthContent {
  username: string;
  password: string;
}

export type { AuthStore, NoneAuthContent, BasicAuthContent };
