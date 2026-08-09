import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { changeLang } from "@/i18n";

interface HexViewerConfig {
  enabled: boolean;
  theme: string;
}

interface quicktypeConfig {
  indentation: string | number;
  justTypes: boolean;
  allPropertiesOptional: boolean;
}

interface BackgroundImageConfig {
  opacity: number;
  blur: number;
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
    const quicktypeConfig = ref({
      indentation: "  ",
      justTypes: false,
      allPropertiesOptional: false,
    } as unknown as Ref<quicktypeConfig>);
    const hexViewerConfig = ref({
      enabled: true,
      theme: "terminal",
    } as unknown as Ref<HexViewerConfig>);
    const backgroundImageConfig = ref({
      opacity: 0.2,
      blur: 0,
    } as unknown as Ref<BackgroundImageConfig>);
    const colorTheme = ref({
      name: "Mocha Theme",
      description: "The default Catppuccin Mocha theme for LigHTTP.",
      author: "SamHacker",
      license: "MIT",

      css: null,
    } as unknown as Ref<ColorTheme>);
    const autoUpdate = ref(true);

    function setQuicktypeConfig(newConfig: quicktypeConfig) {
      quicktypeConfig.value = newConfig;
    }

    function getQuicktypeIndentString(): string {
      // 如果 defaultIndentSize 是字串形式的數字，則重複空白字元；如果是字串，則直接使用該字串作為縮排
      if (typeof quicktypeConfig.value.indentation === "number") {
        return " ".repeat(quicktypeConfig.value.indentation);
      } else if (typeof quicktypeConfig.value.indentation === "string") {
        // 嘗試將字串轉換為數字，如果成功則重複空白字元；如果失敗則直接使用該字串作為縮排
        const indentSize = parseInt(quicktypeConfig.value.indentation, 10);
        if (!isNaN(indentSize)) {
          return " ".repeat(indentSize);
        } else if (quicktypeConfig.value.indentation === "tab") {
          return "\t";
        }
        return quicktypeConfig.value.indentation;
      }
      return "  ";
    }

    function getQuicktypeConfig(): any {
      // 在quicktypeConfig後面加上lang:language
      return quicktypeConfig.value;
    }

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

      autoUpdate,

      backgroundImageUrl,
      setBackgroundImageUrl,
      backgroundImageConfig,

      quicktypeConfig,
      setQuicktypeConfig,
      getQuicktypeIndentString,
      getQuicktypeConfig,

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
export type {
  HexViewerConfig,
  ColorTheme,
  quicktypeConfig,
  BackgroundImageConfig,
};
