<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.general.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <ConfigOptionFrame
      label-key="settings_panel.general.language.label"
      description-key="settings_panel.general.language.description"
    >
      <Select v-model="language">
        <SelectTrigger class="w-32">
          <SelectValue
            :placeholder="
              $t('settings_panel.tabs.general.language.placeholder')
            "
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
    </ConfigOptionFrame>
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/i18n";
import { computed } from "vue";
import { useSettingsStore } from "@/stores/useSettingsStore";
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";

const settingsStore = useSettingsStore();

const language = computed({
  get: () => settingsStore.language,
  set: (v: string) => settingsStore.setLanguage(v),
});
</script>
