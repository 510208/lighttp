<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.themes.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <ConfigOptionFrame
      label-key="settings_panel.themes.theme_selection.label"
      description-key="settings_panel.themes.theme_selection.description"
    >
      <Input
        :placeholder="$t('settings_panel.themes.theme_selection.placeholder')"
        v-model="settingsStore.backgroundImageUrl"
      />
    </ConfigOptionFrame>
    <Separator />
    <ConfigOptionFrame
      label-key="settings_panel.themes.binary_editor_theme.label"
      description-key="settings_panel.themes.binary_editor_theme.description"
    >
      <Select v-model="settingsStore.hexViewerConfig.theme">
        <SelectTrigger>
          <SelectValue placeholder="選擇主題" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>
            {{ $t("settings_panel.themes.binary_editor_theme.dark_themes") }}
          </SelectLabel>
          <SelectItem value="dark">
            Dark ({{ $t("settings_panel.themes.binary_editor_theme.default") }})
          </SelectItem>
          <SelectItem value="terminal">Terminal</SelectItem>
          <SelectItem value="sunset">Sunset</SelectItem>
          <SelectLabel>
            {{ $t("settings_panel.themes.binary_editor_theme.light_themes") }}
          </SelectLabel>
          <SelectItem value="light">Light</SelectItem>
        </SelectContent>
      </Select>
    </ConfigOptionFrame>
  </div>
</template>

<script setup lang="ts">
import Input from "@/components/ui/input/Input.vue";
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Separator from "@/components/ui/separator/Separator.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

const settingsStore = useSettingsStore();
</script>
