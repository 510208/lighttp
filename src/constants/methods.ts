import AuthNone from "@/components/Home/SettingPanel/auth/method/AuthNone.vue";
import AuthBasic from "@/components/Home/SettingPanel/auth/method/AuthBasic.vue";
import AuthBearer from "@/components/Home/SettingPanel/auth/method/AuthBearer.vue";

import BodyNone from "@/components/Home/SettingPanel/body/method/BodyNone.vue";
import BodyOriginal from "@/components/Home/SettingPanel/body/method/BodyOriginal.vue";

export const authMethods = [
  {
    value: "none",
    descriptionKey: "home.settings_panel.tabs.auth.none.hint",
    object: AuthNone,
    label: "None",
  },
  {
    value: "basic",
    descriptionKey: "home.settings_panel.tabs.auth.basic.hint",
    object: AuthBasic,
    label: "Basic",
  },
  {
    value: "bearer",
    descriptionKey: "home.settings_panel.tabs.auth.bearer.hint",
    object: AuthBearer,
    label: "Bearer Token",
  },
];
export type AuthMethod = (typeof authMethods)[number]["label"];

export const bodyMethods = [
  {
    value: "空內容",
    descriptionKey: "home.settings_panel.tabs.body.no_body.hint",
    object: BodyNone,
    label: "None",
  },
  {
    value: "原始文本",
    descriptionKey: "home.settings_panel.tabs.body.body_original.hint",
    object: BodyOriginal,
    label: "Raw",
  },
];
export type BodyMethod = (typeof bodyMethods)[number]["value"];
