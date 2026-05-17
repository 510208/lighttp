import { createI18n, useI18n } from "vue-i18n";
import zhTW from "./json/zh-TW.json";
import enUS from "./json/en.json";

const messages = {
  "zh-TW": zhTW,
  en: enUS,
} as const;

const i18n = createI18n({
  legacy: false,
  // 預設語言
  locale: "zh-TW",
  // 自動注入至全域，讓組件可以直接使用 $t 來翻譯
  globalInjection: true,
  messages: messages as any,
});

function changeLang(lang: string) {
  i18n.global.locale.value = lang;
}

const locale = i18n.global.locale;
const languages: Record<keyof typeof messages, string> = {
  "zh-TW": "繁體中文",
  en: "English",
};

export { useI18n, changeLang, locale, languages, i18n };
