import { defineStore } from "pinia";
import { ref } from "vue";
import { changeLang } from "@/i18n";

export const useSettingsStore = defineStore(
  "settings",
  () => {
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
  },
  {
    tauri: {
      saveOnChange: true,

      // You can also debounce or throttle when saving.
      // This is optional. The default behavior is to save immediately.
      saveStrategy: "debounce",
      saveInterval: 1000,
    },
  },
);
