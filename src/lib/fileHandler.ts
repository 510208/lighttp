import { readTextFile } from "@tauri-apps/plugin-fs";
import { useRequestStore } from "@/stores/useRequestStore";
import { WorkspaceSchema, type WorkspaceData } from "@/schemas/workspace";
import { Dialog } from "@/services";
import { i18n } from "@/i18n";
import { toast } from "vue-sonner";

export async function openLghttpFile(filePath: string): Promise<boolean> {
  try {
    console.log("[LigHTTP CLI] 正在讀取檔案:", filePath);

    // 讀取檔案內容
    const fileContent = await readTextFile(filePath);
    let requestData = JSON.parse(fileContent);

    const parseResult = WorkspaceSchema.safeParse(requestData);
    if (!parseResult.success) {
      console.error(
        "[LigHTTP] Zod 清洗失敗，結構不符:",
        parseResult.error.format(),
      );
      toast.error("檔案結構不符，無法載入");
      return false;
    }

    const sanitizedData: WorkspaceData = parseResult.data;

    // 檢查是否有Proxy設定，如果有，則提示用戶
    if (sanitizedData.proxy) {
      const userChoice = await Dialog.popDialog({
        type: "warning",
        title: i18n.global.t("pop_dialog.proxy_loading_warning.title"),
        description: i18n.global.t(
          "pop_dialog.proxy_loading_warning.description",
        ),
        buttons: "yes-no-cancel",
      });
      if (userChoice === "no") {
        sanitizedData.proxy = null;
      }
      if (userChoice === "cancel") {
        console.log("[LigHTTP CLI] 使用者取消了載入檔案");
        return false;
      }
    }

    // 載入到 Pinia Store
    const requestStore = useRequestStore();
    requestStore.loadRequestData(requestData);

    console.log("[LigHTTP CLI] 成功載入檔案資料至 Store");
    return true;
  } catch (error) {
    console.error("[LigHTTP CLI] 解析或載入檔案失敗:", error);
    return false;
  }
}
