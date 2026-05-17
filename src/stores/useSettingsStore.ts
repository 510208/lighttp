import { defineStore } from "pinia";
import { ref } from "vue";
import { changeLang } from "@/i18n";

export const useSettingsStore = defineStore("settings", () => {
  const language = ref("zh-TW");

  function setLanguage(newLang: string) {
    language.value = newLang;

    // 重新載入語言以應用新的語言設定
    changeLang(newLang);
  }

  return {
    language,
    setLanguage,
  };
});
