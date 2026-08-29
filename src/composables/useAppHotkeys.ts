import { onMounted, onUnmounted } from "vue";
import hotkeys from "hotkeys-js";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { FileHelpers } from "@/services";

export function useAppHotkeys() {
  const settingsStore = useSettingsStore();

  // 1. 初始化與註冊所有熱鍵
  const initHotkeys = () => {
    // Zoom In
    hotkeys("ctrl+=, ctrl+num_add", (event) => {
      event.preventDefault(); // 阻止瀏覽器預設縮放
      settingsStore.changeZoom(0.1);
    });

    // Zoom Out
    hotkeys("ctrl+-, ctrl+num_subtract", (event) => {
      event.preventDefault();
      settingsStore.changeZoom(-0.1);
    });

    // 聚焦到 URL 輸入框
    hotkeys("ctrl+g", (event) => {
      event.preventDefault();
      const inputElement =
        document.querySelector<HTMLInputElement>('input[type="text"]');
      inputElement?.focus();
    });

    // 保存工作區
    hotkeys("ctrl+s", (event) => {
      event.preventDefault();
      FileHelpers.saveWorkspaceToFile();
    });

    // 載入工作區
    hotkeys("ctrl+o", (event) => {
      event.preventDefault();
      FileHelpers.loadWorkspaceFromFile();
    });
  };

  const destroyHotkeys = () => {
    hotkeys.unbind("ctrl+=, ctrl+num_add");
    hotkeys.unbind("ctrl+-, ctrl+num_subtract");
    hotkeys.unbind("ctrl+0, ctrl+num_0");
    hotkeys.unbind("ctrl+g");
    hotkeys.unbind("ctrl+s");
    hotkeys.unbind("ctrl+o");
  };

  onMounted(() => {
    initHotkeys();
  });

  onUnmounted(() => {
    destroyHotkeys();
  });
}
