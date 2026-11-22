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
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { languages } from "@/i18n";
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
} from "@/components/settings/components";

const settingsStore = useSettingsStore();

const language = computed({
  get: () => settingsStore.language,
  set: (value: string) => settingsStore.setLanguage(value),
});
</script>
