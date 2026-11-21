<template>
  <div class="lh-settings-page">
    <SettingsPageHeader
      :title="$t('settings_panel.update.title')"
      :description="appVersion ? `LigHTTP · v${appVersion}` : undefined"
    />

    <SettingsSection>
      <div class="flex flex-col items-center gap-4 rounded-lg border p-4">
        <img :src="logoUrl" alt="LigHTTP" class="h-12 w-auto" />

        <div
          v-if="latestInfo === null"
          class="flex w-full animate-pulse items-center justify-center gap-2 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader class="h-5 w-5 animate-spin" />
          <p>{{ $t("settings_panel.update.checking_for_updates") }}</p>
        </div>

        <div
          v-else-if="typeof latestInfo === 'string'"
          class="flex w-full flex-wrap items-center justify-center gap-2 text-red-500"
          role="alert"
        >
          <CircleX class="h-5 w-5" />
          <p>
            {{ $t("settings_panel.update.check_failed", { error: latestInfo }) }}
          </p>
          <SettingAction @click="checkUpdates">
            {{ $t("settings_panel.update.recheck_button.label") }}
          </SettingAction>
        </div>

        <div
          v-else-if="!latestInfo.needsUpdate"
          class="flex w-full flex-wrap items-center justify-center gap-2 text-green-500"
          role="status"
          aria-live="polite"
        >
          <p>{{ $t("settings_panel.update.up_to_date") }}</p>
          <SettingAction @click="checkUpdates">
            {{ $t("settings_panel.update.recheck_button.label") }}
          </SettingAction>
        </div>

        <div v-else class="flex w-full flex-col items-center gap-4">
          <p class="text-center text-lg font-semibold">
            {{
              $t("settings_panel.update.new_version_available", {
                version: latestInfo.version,
              })
            }}
          </p>

          <div class="text-muted-foreground w-full max-w-xl rounded border p-3 text-sm">
            <VueMarkdown
              class="changelog-container max-h-50 overflow-y-auto"
              :source="
                latestInfo.body ||
                $t('settings_panel.update.no_release_notes', {
                  url: latestInfo.url,
                })
              "
              :plugins="plugins"
            />
          </div>

          <a
            :href="latestInfo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-500 hover:underline"
          >
            {{ $t("settings_panel.update.view_release_notes") }}
          </a>

          <div class="flex flex-wrap items-center justify-center gap-2">
            <SettingAction variant="default" @click="runUpdate()">
              {{ $t("settings_panel.update.update_button.label") }}
            </SettingAction>
            <SettingAction @click="checkUpdates">
              {{ $t("settings_panel.update.recheck_button.label") }}
            </SettingAction>
          </div>
        </div>
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getVersion } from "@tauri-apps/api/app";
import { Loader, CircleX } from "@lucide/vue";
import VueMarkdown from "vue-markdown-render";
import taskLists from "markdown-it-task-lists";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts";

import logoUrl from "@/assets/lighttp_logo_wordmark.svg";
import { SettingAction, SettingsPageHeader, SettingsSection } from "@/components/settings/components";
import {
  type UpdateInfo,
  checkForUpdates,
  runUpdate,
} from "@/services/updater";

const appVersion = ref("");
const latestInfo = ref<null | string | UpdateInfo>(null);
const plugins = [taskLists, MarkdownItGitHubAlerts];

async function checkUpdates(): Promise<void> {
  latestInfo.value = null;

  try {
    latestInfo.value = await checkForUpdates();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    latestInfo.value = message;
    console.error("檢查更新失敗:", error);
  }
}

onMounted(async () => {
  try {
    appVersion.value = await getVersion();
  } catch (error) {
    console.error("取得應用程式版本失敗:", error);
  }

  await checkUpdates();
});
</script>

<style scoped>
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

.changelog-container :deep(a) {
  color: #58a6ff;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.changelog-container :deep(a:hover) {
  color: #79c0ff;
  text-decoration: underline;
}

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

.changelog-container :deep(strong) {
  color: #f0f6fc;
  font-weight: 600;
}

.changelog-container :deep(hr) {
  height: 1px;
  background-color: #30363d;
  border: none;
  margin: 1.25rem 0;
}
</style>
