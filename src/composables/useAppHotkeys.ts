import { onMounted, onUnmounted } from "vue";
import hotkeys from "hotkeys-js";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { FileHelpers, Request } from "@/services";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export function useAppHotkeys() {
  const settingsStore = useSettingsStore();
  const workspace = useWorkspaceStore();
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  const handleWorkspaceShortcut = (event: KeyboardEvent) => {
    if (
      event.isComposing ||
      event.altKey ||
      !(isMac ? event.metaKey : event.ctrlKey)
    )
      return;
    // Leave component shortcuts and text selection available inside editors and dialogs.
    const target = event.target instanceof Element ? event.target : null;
    if (
      target?.closest('[role="dialog"], [role="alertdialog"], .monaco-editor')
    )
      return;
    const key = event.key.toLowerCase();
    if (
      /^[1-9]$/.test(key) &&
      target?.closest('input, textarea, [contenteditable="true"]')
    )
      return;
    if (event.shiftKey && key !== "tab") return;
    let action: (() => void) | undefined;
    if (key === "t")
      action = () => {
        workspace.createTab();
      };
    else if (key === "w" && workspace.activeTabId)
      action = () => {
        workspace.closeTab(workspace.activeTabId!);
      };
    else if (key === "tab")
      action = () => workspace.cycleTabs(event.shiftKey ? -1 : 1);
    else if (/^[1-9]$/.test(key))
      action = () => {
        const index = key === "9" ? workspace.tabs.length - 1 : Number(key) - 1;
        const tab = workspace.tabs[index];
        if (tab) workspace.activateTab(tab.id);
      };
    else if (key === "enter" && workspace.activeTabId)
      action = () => {
        void Request.handleSend();
      };
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  };

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
    window.addEventListener("keydown", handleWorkspaceShortcut, true);
  });

  onUnmounted(() => {
    destroyHotkeys();
    window.removeEventListener("keydown", handleWorkspaceShortcut, true);
  });
}
