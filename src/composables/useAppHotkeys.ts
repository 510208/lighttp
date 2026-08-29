import { onMounted, onUnmounted } from "vue";
import hotkeys from "hotkeys-js";
import { useSettingsStore } from "@/stores/useSettingsStore";

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

    hotkeys("ctrl+g", (event) => {
      // 聚焦到 URL 輸入框
      event.preventDefault();
      const inputElement =
        document.querySelector<HTMLInputElement>('input[type="text"]');
      inputElement?.focus();
    });
  };

  const destroyHotkeys = () => {
    hotkeys.unbind("ctrl+=, ctrl+num_add");
    hotkeys.unbind("ctrl+-, ctrl+num_subtract");
    hotkeys.unbind("ctrl+0, ctrl+num_0");
  };

  onMounted(() => {
    initHotkeys();
  });

  onUnmounted(() => {
    destroyHotkeys();
  });
}
