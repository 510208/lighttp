<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.update.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <div class="flex flex-1 flex-col gap-4 rounded p-2">
      <div class="flex w-full items-center justify-center gap-2">
        <img :src="logoUrl" alt="Lighttp Logo" class="h-12 w-auto" />
      </div>
      <div class="text-center">
        <p class="text-xl font-semibold">Lighttp {{ appVersion }}</p>
      </div>
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
          {{ $t("settings_panel.update.check_failed", { error: latestInfo }) }}
        </p>
      </div>
      <!-- 已是最新版本 -->
      <div
        class="flex w-full items-center justify-center gap-2 text-green-500"
        v-else-if="!latestInfo.needsUpdate"
      >
        <p>{{ $t("settings_panel.update.up_to_date") }}</p>
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
        <Button></Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from "@/assets/lighttp_logo_wordmark.svg";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, Ref, ref } from "vue";
import { Loader, CircleX } from "@lucide/vue";
import { type UpdateInfo, checkForUpdates } from "@/services/updater";
import { Button } from "@/components/ui/button";

const appVersion = ref("");
const latestInfo = ref(null) as Ref<null | string | UpdateInfo>;

onMounted(async () => {
  appVersion.value = await getVersion();

  // 檢查更新
  try {
    latestInfo.value = await checkForUpdates();
  } catch (error) {
    if (error instanceof Error) {
      latestInfo.value = error.message; // 表示檢查更新失敗
      console.error("檢查更新失敗:", error.message);
    } else {
      latestInfo.value = "Unknown error"; // 非 Error 物件的錯誤
      console.error("檢查更新失敗: Unknown error", error);
    }
  }
});
</script>
