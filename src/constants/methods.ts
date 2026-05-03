import AuthNone from "@/components/SettingPanel/auth/method/AuthNone.vue";
import AuthBasic from "@/components/SettingPanel/auth/method/AuthBasic.vue";
import AuthBearer from "@/components/SettingPanel/auth/method/AuthBearer.vue";

import BodyNone from "@/components/SettingPanel/body/method/BodyNone.vue";
import BodyOriginal from "@/components/SettingPanel/body/method/BodyOriginal.vue";

export const authMethods = [
  {
    value: "none",
    description: "不使用任何認證方式。\n\n適用於不需要身份驗證的公開 API。",
    object: AuthNone,
    label: "None",
  },
  {
    value: "basic",
    description:
      "基本驗證方式。\n\n使用此方式後系統會自動在 Header 中加入 Authorization: Basic ... 標頭。",
    object: AuthBasic,
    label: "Basic",
  },
  {
    value: "bearer",
    description:
      "Bearer Token 認證方式。\n\nBearer Token 是一種常見的 API 認證方式，通常用於 OAuth 2.0 中。\n使用此方式後系統會自動在 Header 中加入 Authorization: Bearer ... 標頭。",
    object: AuthBearer,
    label: "Bearer Token",
  },
];
export type AuthMethod = (typeof authMethods)[number]["label"];

export const bodyMethods = [
  {
    value: "空內容",
    description: "不包含任何內容的請求體。",
    object: BodyNone,
    label: "None",
  },
  {
    value: "原始文本",
    description: "使用純文本（含JSON、XML等）作為請求主體。",
    object: BodyOriginal,
    label: "Original",
  },
];
export type BodyMethod = (typeof bodyMethods)[number]["value"];
