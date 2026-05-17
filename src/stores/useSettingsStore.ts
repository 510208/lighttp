import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const language = ref("zh-TW");

  function setLanguage(newLang: string) {
    language.value = newLang;
  }

  return {
    language,
    setLanguage,
  };
});
