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
          <div
            class="text-muted-foreground max-w-xl rounded border p-2 text-sm"
          >
            <VueMarkdown
              class="changelog-container max-h-50 overflow-y-scroll"
              :source="
                latestInfo.body
                  ? latestInfo.body
                  : $t('settings_panel.update.no_release_notes', {
                      url: latestInfo.url,
                    })
              "
              :plugins="plugins"
            />
          </div>
          <a
            :href="latestInfo.url"
            target="_blank"
            class="text-sm text-blue-500 hover:underline"
          >
            {{ $t("settings_panel.update.view_release_notes") }}
          </a>
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
const appVersion = ref("");
const latestInfo = ref(null) as Ref<null | string | UpdateInfo>;

import VueMarkdown from "vue-markdown-render";
import taskLists from "markdown-it-task-lists";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts"; // For > [!NOTE] styles

const plugins = [taskLists, MarkdownItGitHubAlerts];

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

<style scoped>
/* 深度選擇器：針對 VueMarkdown 動態產生的 DOM 子元素 */
.changelog-container :deep(h2) {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f0f6fc;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #21262d;
}

.changelog-container :deep(h2:first-child) {
  margin-top: 0;
}

/* 超連結 */
.changelog-container :deep(a) {
  color: #58a6ff;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.changelog-container :deep(a:hover) {
  color: #79c0ff;
  text-decoration: underline;
}

/* GitHub Markdown Alert (Important) */
.changelog-container :deep(.markdown-alert.important) {
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  background-color: rgba(137, 87, 229, 0.1);
  border-left: 4px solid #8957e5;
  border-radius: 0.4rem;
  color: #d2a8ff;
}

.changelog-container :deep(.markdown-alert-icon) {
  fill: #8957e5;
  vertical-align: text-bottom;
  margin-right: 0.35rem;
  display: inline-block;
}

.changelog-container :deep(.markdown-alert span) {
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.changelog-container :deep(.markdown-alert p) {
  margin: 0;
  font-size: 0.875rem;
  color: #c9d1d9;
}

.changelog-container :deep(.markdown-alert a) {
  color: #d2a8ff;
  text-decoration: underline;
}

/* 清單與 Task List */
.changelog-container :deep(ul.contains-task-list) {
  list-style-type: none;
  padding-left: 0;
  margin: 1rem 0;
}

.changelog-container :deep(.task-list-item) {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* 客製化已勾選 Checkbox */
.changelog-container :deep(.task-list-item-checkbox) {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  margin-right: 0.6rem;
  margin-top: 0.2rem;
  border-radius: 4px;
  background-color: #238636;
  border: 1px solid #238636;
  position: relative;
  cursor: default;
  flex-shrink: 0;
}

.changelog-container :deep(.task-list-item-checkbox:checked::after) {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 強調文字與標籤 */
.changelog-container :deep(strong) {
  color: #f0f6fc;
  font-weight: 600;
}

/* 分隔線 */
.changelog-container :deep(hr) {
  height: 1px;
  background-color: #30363d;
  border: none;
  margin: 1.25rem 0;
}
</style>
