export const authMethods = [
  {
    value: "無認證",
    description: "不使用任何認證方式。\n\n適用於不需要身份驗證的公開 API。",
    object: null,
    label: "None",
  },
  {
    value: "Basic",
    description:
      "基本驗證方式。\n\n使用此方式後系統會自動在 Header 中加入 Authorization: Basic ... 標頭。",
    object: null,
    label: "Basic",
  },
];

export type AuthMethod = (typeof authMethods)[number]["value"];
