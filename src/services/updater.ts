import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateInfo {
  needsUpdate: boolean;
  currentVersion: string;
  version?: string;
  date?: string;
  body?: string;
  rawJson?: Record<string, unknown>;
}

async function checkForUpdates() {
  const update = await check();
  const currentVersion = update?.currentVersion || "unknown";
  if (update) {
    const updateInfo: UpdateInfo = {
      needsUpdate: true,
      currentVersion: update.currentVersion,
      version: update.version,
      date: update.date,
      body: update.body,
      rawJson: update.rawJson,
    };
    console.log("[updater] Update available:", updateInfo);

    return updateInfo;
  }

  console.log("[updater] Up-to-date.");
  return {
    needsUpdate: false,
    currentVersion: currentVersion,
  } as UpdateInfo;
}

async function runUpdate() {
  const update = await check();
  if (update) {
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`,
    );
    let downloaded = 0;
    let contentLength = 0;
    // alternatively we could also call update.download() and update.install() separately
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength as number;
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case "Finished":
          console.log("download finished");
          break;
      }
    });

    console.log("update installed");
    await relaunch();
  }
}

export { checkForUpdates, runUpdate };
export type { UpdateInfo };
