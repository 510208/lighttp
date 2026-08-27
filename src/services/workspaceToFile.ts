import { openLghttpFile } from "@/lib/fileHandler";
import { useRequestStore } from "@/stores/useRequestStore";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "vue-sonner";
import { Dialog } from "@/services";

async function saveWorkspaceToFile(): Promise<void> {
  let data = useRequestStore().getRequestData();

  const filePath = await save({
    filters: [
      {
        name: "LigHTTP Workspace JSON (*.lghttp.json)",
        extensions: ["lghttp.json"],
      },
    ],
  });
  if (!filePath) {
    toast.error("選擇的儲存路徑為空");
    return;
  }

  // 檢查是否有Proxy設定，如果有，提示用戶是否要保存
  const hasProxy = data.proxy && Object.keys(data.proxy).length > 0;
  if (hasProxy) {
    const userChoice = await Dialog.popDialog({
      type: "warning",
      title: "Proxy 設定警告",
      description:
        "您有一些請求設定了 Proxy。請注意，保存這些設定可能會導致安全風險。您確定要繼續保存嗎？\n\n如果您需要保存 Proxy 設定，請選擇「是」。如果您不想保存 Proxy 設定，請選擇「否」。如果您想取消存檔操作，請選擇「取消」。",
      buttons: "yes-no-cancel",
    });

    if (userChoice === "cancel") {
      toast.error("已取消保存工作");
      return;
    }

    if (userChoice === "no") {
      // 移除 Proxy 設定
      data.proxy = null;
    }
  }

  const dataString = JSON.stringify(data, null, 2);

  await writeTextFile(`${filePath}`, dataString);

  toast.success("工作已成功儲存");
}

async function loadWorkspaceFromFile(): Promise<void> {
  const filePath = await open({
    filters: [
      {
        name: "LigHTTP Workspace JSON (*.lghttp.json)",
        extensions: ["lghttp.json"],
      },
      {
        name: "JSON Files (*.json)",
        extensions: ["json"],
      },
      {
        name: "All Files (*.*)",
        extensions: ["*"],
      },
    ],
  });
  if (!filePath) {
    toast.error("選擇的檔案路徑為空");
    return;
  }

  await openLghttpFile(filePath as string);

  toast.success("工作已成功載入");
}

export { saveWorkspaceToFile, loadWorkspaceFromFile };
