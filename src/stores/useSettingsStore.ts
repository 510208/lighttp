import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { changeLang } from "@/i18n";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const language = ref("zh-TW");
    const backgroundImageUrl = ref("");
    const defaultIndentSize = ref(2) as Ref<number | string>;
    const hexViewerConfig = ref({
      enabled: true,
      theme: "terminal",
    });

    function setLanguage(newLang: string) {
      language.value = newLang;
      // 重新載入語言以應用新的語言設定
      changeLang(newLang);
    }

    function setBackgroundImageUrl(url: string) {
      backgroundImageUrl.value = url;
    }

    return {
      language,
      setLanguage,

      backgroundImageUrl,
      setBackgroundImageUrl,

      defaultIndentSize,

      hexViewerConfig,
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
