import AuthNone from "@/components/SettingPanel/auth/method/AuthNone.vue";
import AuthBasic from "@/components/SettingPanel/auth/method/AuthBasic.vue";
import AuthBearer from "@/components/SettingPanel/auth/method/AuthBearer.vue";

export const authMethods = [
  {
    value: "無認證",
    description: "不使用任何認證方式。\n\n適用於不需要身份驗證的公開 API。",
    object: AuthNone,
    label: "None",
  },
  {
    value: "Basic",
    description:
      "基本驗證方式。\n\n使用此方式後系統會自動在 Header 中加入 Authorization: Basic ... 標頭。",
    object: AuthBasic,
    label: "Basic",
  },
  {
    value: "Bearer",
    description:
      "Bearer Token 認證方式。\n\nBearer Token 是一種常見的 API 認證方式，通常用於 OAuth 2.0 中。\n使用此方式後系統會自動在 Header 中加入 Authorization: Bearer ... 標頭。",
    object: AuthBearer,
    label: "Bearer Token",
  },
];

export type AuthMethod = (typeof authMethods)[number]["value"];
