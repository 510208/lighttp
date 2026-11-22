import AuthNone from "@/components/Home/SettingPanel/auth/method/AuthNone.vue";
import AuthBasic from "@/components/Home/SettingPanel/auth/method/AuthBasic.vue";
import AuthBearer from "@/components/Home/SettingPanel/auth/method/AuthBearer.vue";

import BodyNone from "@/components/Home/SettingPanel/body/method/BodyNone.vue";
import BodyOriginal from "@/components/Home/SettingPanel/body/method/BodyOriginal.vue";
import BodyForm from "@/components/Home/SettingPanel/body/method/BodyForm.vue";
import BodyBinary from "@/components/Home/SettingPanel/body/method/BodyBinary.vue";

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
  {
    value: "form-data",
    descriptionKey: "home.settings_panel.tabs.body.form_data.hint",
    object: BodyForm,
    label: "Form Data",
    props: { multipart: true },
  },
  {
    value: "url-encoded",
    descriptionKey: "home.settings_panel.tabs.body.url_encoded.hint",
    object: BodyForm,
    label: "URL Encoded",
    props: { multipart: false },
  },
  {
    value: "binary",
    descriptionKey: "home.settings_panel.tabs.body.binary.hint",
    object: BodyBinary,
    label: "Binary",
  },
];
export type BodyMethod = (typeof bodyMethods)[number]["value"];
