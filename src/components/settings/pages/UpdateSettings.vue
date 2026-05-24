<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.update.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <div class="flex flex-1 flex-col gap-4 rounded p-2">
      <div class="flex w-full items-center justify-center gap-2">
        <img :src="logoUrl" alt="Lighttp Logo" class="h-12 w-auto" />
      </div>
      <div
        class="text-muted-foreground mt-4 flex w-full items-center justify-center gap-2"
      >
        <!-- 檢查更新中 -->
        <div
          class="flex w-full animate-pulse items-center justify-center gap-2"
          v-if="latestInfo === null"
        >
          <Loader class="h-5 w-5 animate-spin" />
          <p>{{ $t("settings_panel.update.checking_for_updates") }}</p>
        </div>
        <!-- 檢查更新失敗 -->
        <div
          class="flex w-full items-center justify-center gap-2 text-red-500"
          v-else-if="typeof latestInfo === 'string'"
        >
          <CircleX class="h-5 w-5" />
          <p>
            {{
              $t("settings_panel.update.check_failed", { error: latestInfo })
            }}
          </p>
          <Button variant="outline" @click="checkUpdates">
            {{ $t("settings_panel.update.recheck_button.label") }}
          </Button>
        </div>
        <!-- 已是最新版本 -->
        <div
          class="flex w-full items-center justify-center gap-2 text-green-500"
          v-else-if="!latestInfo.needsUpdate"
        >
          <p>{{ $t("settings_panel.update.up_to_date") }}</p>
          <Button variant="outline" @click="checkUpdates">
            {{ $t("settings_panel.update.recheck_button.label") }}
          </Button>
        </div>
        <!-- 有新版本可用 -->
        <div
          class="flex w-full flex-col items-center justify-center gap-4"
          v-else
        >
          <p class="text-center text-lg font-semibold">
            {{
              $t("settings_panel.update.new_version_available", {
                version: latestInfo.version,
              })
            }}
          </p>
          <p class="text-muted-foreground max-w-md text-center text-sm">
            {{
              latestInfo.body ||
              $t("settings_panel.update.no_release_notes", {
                url: latestInfo.url,
              })
            }}
          </p>
          <div class="flex items-center gap-2">
            <Button @click="runUpdate()">
              {{ $t("settings_panel.update.update_button.label") }}
            </Button>
            <Button variant="outline" @click="checkUpdates">
              {{ $t("settings_panel.update.recheck_button.label") }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from "@/assets/lighttp_logo_wordmark.svg";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, Ref, ref } from "vue";
import { Loader, CircleX } from "@lucide/vue";
import {
  type UpdateInfo,
  checkForUpdates,
  runUpdate,
} from "@/services/updater";
import { Button } from "@/components/ui/button";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const appVersion = ref("");
const latestInfo = ref(null) as Ref<null | string | UpdateInfo>;

function checkUpdates() {
  latestInfo.value = null; // 重置狀態以顯示檢查中
  checkForUpdates()
    .then((info) => {
      latestInfo.value = info;
    })
    .catch((error) => {
      if (error instanceof Error) {
        latestInfo.value = error.message;
        console.error("檢查更新失敗:", error.message);
      } else {
        latestInfo.value = "Unknown error";
        console.error("檢查更新失敗: Unknown error", error);
      }
    });
}

onMounted(async () => {
  appVersion.value = await getVersion();

  // 檢查更新
  checkUpdates();
});
</script>
