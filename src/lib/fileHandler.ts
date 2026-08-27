import { readTextFile } from "@tauri-apps/plugin-fs";
import { useRequestStore } from "@/stores/useRequestStore";
import { Dialog } from "@/services";

export async function openLghttpFile(filePath: string) {
  try {
    console.log("[LigHTTP CLI] 正在讀取檔案:", filePath);

    // 讀取檔案內容
    const fileContent = await readTextFile(filePath);

    // 解析 JSON 資料
    let requestData = JSON.parse(fileContent);

    // 檢查是否有Proxy設定，如果有，則提示用戶
    if (requestData.proxy) {
      const userChoice = await Dialog.popDialog({
        type: "warning",
        title: "安全性警告",
        description:
          "檔案中包含內建的Proxy設定，倘若攻擊者帶有惡意，則這些設定可能會造成中間人攻擊 (MitM)。\n請只在您信任這個檔案的來源並確定其內容時選擇保留。\n\n如果您信任這個Proxy設定，請單按「是」來載入這些設定，否則請按「否」來忽略這些Proxy設定。若您不確定，請按「取消」來中止載入。\n按下「否」後，其他設定仍會保留，LigHTTP只會忽略Proxy相關的設定。",
        buttons: "yes-no-cancel",
      });
      if (userChoice === "no") {
        delete requestData.proxy;
      }
      if (userChoice === "cancel") {
        console.log("[LigHTTP CLI] 使用者取消了載入檔案");
        return;
      }
    }

    // 載入到 Pinia Store
    const requestStore = useRequestStore();
    requestStore.loadRequestData(requestData);

    console.log("[LigHTTP CLI] 成功載入檔案資料至 Store");
  } catch (error) {
    console.error("[LigHTTP CLI] 解析或載入檔案失敗:", error);
  }
}
