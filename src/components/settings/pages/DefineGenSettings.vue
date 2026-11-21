<template>
  <div class="lh-settings-page">
    <SettingsPageHeader :title="$t('settings_panel.define_gen.title')" />

    <SettingsSection>
      <SettingRow
        :title="$t('settings_panel.define_gen.indent.label')"
        :description="$t('settings_panel.define_gen.indent.description')"
      >
        <Select v-model="settingsStore.quicktypeConfig.indentation">
          <SelectTrigger class="w-32">
            <SelectValue :placeholder="$t('settings_panel.define_gen.indent.placeholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="'\\t'">
                {{ $t("settings_panel.define_gen.indent.options.tab") }}
              </SelectItem>
              <SelectItem :value="'  '">
                {{ $t("settings_panel.define_gen.indent.options.spaces", { count: 2 }) }}
              </SelectItem>
              <SelectItem :value="'    '">
                {{ $t("settings_panel.define_gen.indent.options.spaces", { count: 4 }) }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.define_gen.only_types.label')"
        :description="$t('settings_panel.define_gen.only_types.description')"
      >
        <SettingSwitch v-model="settingsStore.quicktypeConfig.justTypes" />
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.define_gen.all_as_optional.label')"
        :description="$t('settings_panel.define_gen.all_as_optional.description')"
      >
        <SettingSwitch v-model="settingsStore.quicktypeConfig.allPropertiesOptional" />
      </SettingRow>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
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
</script>
