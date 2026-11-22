import { open } from "@tauri-apps/plugin-dialog";
import { useRequestStore } from "@/stores/useRequestStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { i18n } from "@/i18n";
import { toast } from "vue-sonner";

export async function selectBodyFile(fieldId?: string): Promise<void> {
  const requestStore = useRequestStore();
  const workspace = useWorkspaceStore();
  const tabId = workspace.activeTabId;
  if (!tabId) return;
  const request = requestStore.getRequest(tabId);
  if (!request) return;

  try {
    const filePath = await open({ multiple: false, directory: false });
    if (!filePath || typeof filePath !== "string") return;

    // 對話框開啟期間可能切換、關閉或重新載入分頁，只更新原本的請求。
    if (requestStore.getRequest(tabId) !== request) return;
    if (fieldId !== undefined) {
      const field = request.formData.find((item) => item.id === fieldId);
      if (field?.type !== "file") return;
      field.filePath = filePath;
    } else {
      requestStore.updateRequest(tabId, { bodyFilePath: filePath });
    }
    workspace.touchTab(tabId);
  } catch (error) {
    toast.error(
      i18n.global.t("home.settings_panel.tabs.body.file_select_error", {
        error: String(error),
      }),
    );
  }
}
