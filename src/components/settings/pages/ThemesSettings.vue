<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.themes.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <ConfigOptionFrame
      label-key="settings_panel.tabs.themes.theme_selection.label"
      description-key="settings_panel.tabs.themes.theme_selection.description"
    >
      <Input
        :placeholder="
          $t('settings_panel.tabs.themes.theme_selection.placeholder')
        "
        v-model="settingsStore.backgroundImageUrl"
      />
    </ConfigOptionFrame>
    <ConfigOptionFrame
      label-key="settings_panel.tabs.themes.ui_font.label"
      description-key="settings_panel.tabs.themes.ui_font.description"
    >
      <Input
        :placeholder="$t('settings_panel.tabs.themes.ui_font.placeholder')"
        v-model="settingsStore.uiFont"
      />
    </ConfigOptionFrame>
    <ConfigOptionFrame
      label-key="settings_panel.tabs.themes.editor_font.label"
      description-key="settings_panel.tabs.themes.editor_font.description"
    >
      <Input
        :placeholder="$t('settings_panel.tabs.themes.editor_font.placeholder')"
        v-model="settingsStore.editorFont"
      />
    </ConfigOptionFrame>
  </div>
</template>

<script setup lang="ts">
import Input from "@/components/ui/input/Input.vue";
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";
import { useSettingsStore } from "@/stores/useSettingsStore";

const settingsStore = useSettingsStore();
</script>
