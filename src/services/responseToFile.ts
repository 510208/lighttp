import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "vue-sonner";

async function saveResponseToFile(response: Uint8Array): Promise<void> {
  const filePath = await save({
    filters: [
      {
        name: "All Files (*.*)",
        extensions: ["*"],
      },
    ],
  });

  if (!filePath) {
    toast.error("選擇的儲存路徑為空");
    return;
  }

  await writeFile(`${filePath}`, response);

  toast.success("檔案已成功儲存");
}

export { saveResponseToFile };
