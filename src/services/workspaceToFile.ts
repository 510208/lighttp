import { useRequestStore } from "@/stores/useRequestStore";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "vue-sonner";

async function saveWorkspaceToFile(): Promise<void> {
  const data = useRequestStore().getRequestData();
  const dataString = JSON.stringify(data, null, 2);

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

  await writeTextFile(`${filePath}`, dataString);

  toast.success("工作已成功儲存");
}

async function loadWorkspaceFromFile(): Promise<void> {
  const filePath = await open({
    filters: [
      {
        name: "LigHTTP Workspace JSON (*.json)",
        extensions: ["json"],
      },
    ],
  });
  if (!filePath) {
    toast.error("選擇的檔案路徑為空");
    return;
  }

  const dataString = await readTextFile(filePath);
  const data = JSON.parse(dataString);
  useRequestStore().loadRequestData(data);

  toast.success("工作已成功載入");
}

export { saveWorkspaceToFile, loadWorkspaceFromFile };
