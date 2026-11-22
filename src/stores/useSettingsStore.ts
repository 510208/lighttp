import { defineStore } from "pinia";
import { Ref, ref, watch } from "vue";
import { changeLang } from "@/i18n";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { createDefaultHttpClientConfig } from "@/lib/httpClientConfig";

type StartupBehavior = "new-request" | "resume" | "empty";

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
  // 只讀取第一段 CSS 註解作為 Metadata
  const metadata = cssContent.match(/^\s*\/\*([\s\S]*?)\*\//)?.[1];

  if (!metadata) {
    throw new Error("Invalid theme CSS: Missing metadata");
  }

  function getField(name: string): string {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const match = metadata?.match(
      new RegExp(`^\\s*${escapedName}\\s*:\\s*(.*?)\\s*$`, "mi"),
    );

    if (!match || !match[1]) {
      throw new Error(`Invalid theme CSS: Missing ${name}`);
    }

    return match[1].trim();
  }

  return {
    name: getField("Theme Name"),
    description: getField("Description"),
    author: getField("Author"),
    license: getField("License"),
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
    const startupBehavior = ref<StartupBehavior>("resume");
    const httpClientConfig = ref(createDefaultHttpClientConfig());
    const zoomRatio = ref(1.0 as number);

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

    function changeZoom(amount: number) {
      const currentRatio = Number(zoomRatio.value);
      const step = Number(amount);

      let nextValue = currentRatio + step;
      nextValue = parseFloat(nextValue.toFixed(1));

      // 限制區間在 0.5 到 3.0 之間
      zoomRatio.value = Math.max(0.5, Math.min(2.0, nextValue));
    }

    watch(
      zoomRatio,
      async (newRatio) => {
        try {
          const appWindow = getCurrentWebview(); // 取得當前視窗實例 [1]
          await appWindow.setZoom(newRatio); // 呼叫 Tauri 原生縮放 API [1]
        } catch (error) {
          console.error("Tauri zoom failed:", error);
        }
      },
      { immediate: true },
    ); // 初始建立時就套用一次

    function setColorTheme(cssContent: string | null): void {
      if (cssContent === null) {
        colorTheme.value = {
          name: "Mocha Theme",
          description: "The default Catppuccin Mocha theme for LigHTTP.",
          author: "SamHacker",
          license: "MIT",
          css: null,
        };

        return;
      }

      // 先解析，成功後才更新 Store，避免錯誤資料覆蓋原本設定。
      colorTheme.value = loadColorTheme(cssContent);
    }

    return {
      language,
      setLanguage,

      autoUpdate,
      startupBehavior,
      httpClientConfig,

      backgroundImageUrl,
      setBackgroundImageUrl,
      backgroundImageConfig,

      quicktypeConfig,
      setQuicktypeConfig,
      getQuicktypeIndentString,
      getQuicktypeConfig,

      hexViewerConfig,

      zoomRatio,
      changeZoom,

      colorTheme,
      setColorTheme,
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
