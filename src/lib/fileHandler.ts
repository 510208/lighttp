import { readTextFile } from "@tauri-apps/plugin-fs";
import { useRequestStore } from "@/stores/useRequestStore";

export async function openLghttpFile(filePath: string) {
  try {
    console.log("[LigHTTP CLI] 正在讀取檔案:", filePath);

    // 讀取檔案內容
    const fileContent = await readTextFile(filePath);

    // 解析 JSON 資料
    const requestData = JSON.parse(fileContent);

    // 載入到 Pinia Store
    const requestStore = useRequestStore();
    requestStore.loadRequestData(requestData);

    console.log("[LigHTTP CLI] 成功載入檔案資料至 Store");
  } catch (error) {
    console.error("[LigHTTP CLI] 解析或載入檔案失敗:", error);
  }
}
