import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { changeLang } from "@/i18n";

interface HexViewerConfig {
  enabled: boolean;
  theme: string;
}

interface ColorTheme {
  name: string;
  description: string;
  author: string;
  license: string;
  css: string | null;
}

function loadColorTheme(cssContent: string): ColorTheme {
  // 提取出 CSS 中的Metadata
  // /*
  // Theme Name:     Mocha Theme
  // Description:    The default Catppuccin Mocha theme for LigHTTP.
  // Author:         SamHacker
  // License:        MIT
  // */
  // @theme inline { /* ... */ }
  const metadataRegex =
    /\/\*\s*Theme Name:\s*(.+?)\s*Description:\s*(.+?)\s*Author:\s*(.+?)\s*License:\s*(.+?)\s*\*\//s;
  const match = cssContent.match(metadataRegex);
  if (!match) {
    throw new Error("Invalid theme CSS: Missing metadata");
  }

  const [_, name, description, author, license] = match;

  return {
    name: name.trim(),
    description: description.trim(),
    author: author.trim(),
    license: license.trim(),
    css: cssContent,
  };
}

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const language = ref("zh-TW");
    const backgroundImageUrl = ref("");
    const defaultIndentSize = ref(2) as Ref<number | string>;
    const hexViewerConfig = ref({
      enabled: true,
      theme: "terminal",
    } as unknown as Ref<HexViewerConfig>);
    const colorTheme = ref({
      name: "Mocha Theme",
      description: "The default Catppuccin Mocha theme for LigHTTP.",
      author: "SamHacker",
      license: "MIT",

      css: null,
    } as unknown as Ref<ColorTheme>);

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

      colorTheme,
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

export type SettingsStore = ReturnType<typeof useSettingsStore>;
export { loadColorTheme };
export type { HexViewerConfig, ColorTheme };
