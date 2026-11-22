<template>
  <div class="lh-settings-page">
    <SettingsPageHeader :title="$t('settings_panel.general.title')" />

    <SettingsSection>
      <SettingRow
        :title="$t('settings_panel.general.language.label')"
        :description="$t('settings_panel.general.language.description')"
      >
        <Select v-model="language">
          <SelectTrigger class="w-32">
            <SelectValue
              :placeholder="$t('settings_panel.general.language.placeholder')"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="(name, code) in languages"
                :key="code"
                :value="code"
              >
                {{ name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.general.startup_behavior.label')"
        :description="$t('settings_panel.general.startup_behavior.description')"
      >
        <Select v-model="settingsStore.startupBehavior">
          <SelectTrigger class="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="new-request">
                {{ $t("settings_panel.general.startup_behavior.new_request") }}
              </SelectItem>
              <SelectItem value="resume">
                {{ $t("settings_panel.general.startup_behavior.resume") }}
              </SelectItem>
              <SelectItem value="empty">
                {{ $t("settings_panel.general.startup_behavior.empty") }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.general.check_update_when_open.label')"
        :description="
          $t('settings_panel.general.check_update_when_open.description')
        "
      >
        <SettingSwitch v-model="settingsStore.autoUpdate" />
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.general.settings_file.label')"
        :description="$t('settings_panel.general.settings_file.description')"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <SettingAction
                :disabled="openingSettingsFile"
                @click="openSettingsLocation"
              >
                <FolderOpen />
                {{ $t("settings_panel.general.settings_file.open") }}
              </SettingAction>
            </TooltipTrigger>

            <TooltipContent>
              {{ configFilePath }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SettingRow>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getStorePath, saveNow } from "@tauri-store/pinia";
import { dirname } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import { toast } from "vue-sonner";
import { languages, useI18n } from "@/i18n";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsPageHeader,
  SettingsSection,
  SettingRow,
  SettingSwitch,
  SettingAction,
} from "@/components/settings/components";

import { FolderOpen } from "@lucide/vue";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const settingsStore = useSettingsStore();
const { t } = useI18n();
const openingSettingsFile = ref(false);
const configFilePath = ref("N/A");

onMounted(async () => {
  configFilePath.value = await getStorePath(settingsStore.$id);
})

async function openSettingsLocation(): Promise<void> {
  if (openingSettingsFile.value) return;

  openingSettingsFile.value = true;

  try {
    // 先立即儲存，確保首次使用時設定檔已存在，且包含尚未寫入的變更。
    await saveNow(settingsStore.$id);
    const settingsPath = await getStorePath(settingsStore.$id);
    // 直接開啟父資料夾，避免依賴桌面環境的檔案選取服務。
    const settingsDirectory = await dirname(settingsPath);
    await openPath(settingsDirectory);
  } catch (error) {
    console.error("Failed to open settings location:", error);
    toast.error(t("settings_panel.general.settings_file.open_failed"), {
      description: String(error),
    });
  } finally {
    openingSettingsFile.value = false;
  }
}

const language = computed({
  get: () => settingsStore.language,
  set: (value: string) => settingsStore.setLanguage(value),
});
</script>
