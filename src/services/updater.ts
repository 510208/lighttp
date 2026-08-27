import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "vue-sonner";
import { openUrl } from "@tauri-apps/plugin-opener";
import { i18n } from "@/i18n";

interface UpdateInfo {
  needsUpdate: boolean;
  currentVersion: string;
  version?: string;
  date?: string;
  body?: string;
  rawJson?: Record<string, unknown>;
  url?: string;
}

async function checkForUpdates() {
  const update = await check();
  const currentVersion = update?.currentVersion || "unknown";
  if (update) {
    const versionWithoutPrefix = update.version.startsWith("v")
      ? update.version.slice(1)
      : update.version;
    const url = `https://github.com/510208/lighttp/releases/tag/app-v${versionWithoutPrefix}`;

    // 向GitHub取得release最新版本的更新日誌，而非使用updater提供的更新日誌，因為updater提供的更新日誌可能不完整
    const releaseNotes = await fetch(
      `https://api.github.com/repos/510208/lighttp/releases/tags/app-v${versionWithoutPrefix}`,
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch release notes: HTTP ${res.status}`);
        }
        const data: unknown = await res.json();

        // 確保data型態
        if (
          typeof data === "object" &&
          data !== null &&
          "body" in data &&
          typeof data.body === "string"
        ) {
          return data.body;
        }

        return undefined;
      })
      .catch((err) => {
        console.warn(
          "[updater] Fetch release notes failed, fallback to default body:",
          err,
        );
        return undefined;
      });

    const updateInfo: UpdateInfo = {
      needsUpdate: true,
      currentVersion: update.currentVersion,
      version: update.version,
      date: update.date,
      body: releaseNotes ? releaseNotes : update.body,
      rawJson: update.rawJson,
      url: url,
    };

    let descriptionToShow =
      updateInfo.body?.slice(0, 50) ||
      i18n.global.t("updater.no_release_notes");

    if (updateInfo.body && updateInfo.body.length > 50) {
      descriptionToShow += "...";
    }

    toast.info(
      i18n.global.t("updater.update_available.message", {
        version: updateInfo.version,
      }),
      {
        description: descriptionToShow,
        action: {
          label: i18n.global.t("updater.view_on_github"),
          onClick: () => {
            openUrl(url);
          },
        },
      },
    );
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
  try {
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
            console.log(
              `started downloading ${event.data.contentLength} bytes`,
            );
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
  } catch (error) {
    toast.error(i18n.global.t("updater.update_failed"));
    console.error("Failed to update:", error);
  }
}

export { checkForUpdates, runUpdate };
export type { UpdateInfo };
