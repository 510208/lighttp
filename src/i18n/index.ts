import { createI18n, useI18n } from "vue-i18n";
import zhTW from "./json/zh-TW.json";

const messages = {
  "zh-TW": zhTW,
} as const;

const i18n = createI18n({
  legacy: false,
  // 預設語言
  locale: "zh-TW",
  // 自動注入至全域，讓組件可以直接使用 $t 來翻譯
  globalInjection: true,
  messages: messages as any,
});

export function changeLang(lang: string) {
  i18n.global.locale.value = lang;
}

const locale = i18n.global.locale;

export { useI18n, locale, i18n };
