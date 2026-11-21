<template>
  <div class="lh-settings-page">
    <SettingsPageHeader :title="$t('settings_panel.themes.title')" />

    <SettingsSection>
      <SettingRow
        :title="$t('settings_panel.themes.theme_selection.label')"
        :description="$t('settings_panel.themes.theme_selection.description')"
        layout="vertical"
      >
        <SettingInput
          v-model="settingsStore.backgroundImageUrl"
          :placeholder="$t('settings_panel.themes.theme_selection.placeholder')"
          class="w-full"
        />
      </SettingRow>

      <SettingRow
        :title="$t('settings_panel.themes.background_image_opacity.label')"
        :description="$t('settings_panel.themes.background_image_opacity.description')"
        layout="vertical"
      >
        <SettingSlider
          v-model="opacitySlider"
          :min="0"
          :max="1"
          :step="0.01"
          class="w-full"
        />
      </SettingRow>

      <SettingRow
        :title="$t('settings_panel.themes.background_image_blur.label')"
        :description="$t('settings_panel.themes.background_image_blur.description')"
        layout="vertical"
      >
        <SettingSlider
          v-model="blurSlider"
          :min="0"
          :max="30"
          :step="1"
          class="w-full"
        />
      </SettingRow>
    </SettingsSection>

    <Separator />

    <SettingsSection>
      <SettingRow
        :title="$t('settings_panel.themes.color_theme.label')"
        :description="$t('settings_panel.themes.color_theme.description')"
        layout="vertical"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <SettingAction variant="default" :disabled="isImporting" @click="importColorTheme">
              <Palette class="mr-2 size-4" />
              {{ isImporting ? "匯入中..." : "匯入主題" }}
            </SettingAction>
            <SettingAction variant="outline" @click="resetColorTheme">
              <RotateCcw class="mr-2 size-4" />
              恢復預設
            </SettingAction>
          </div>

          <div class="space-y-1 rounded-lg border p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold">{{ settingsStore.colorTheme.name }}</p>
              <span class="text-muted-foreground text-xs">
                {{ settingsStore.colorTheme.license }}
              </span>
            </div>
            <p class="text-muted-foreground text-sm">
              {{ settingsStore.colorTheme.description }}
            </p>
            <p class="text-muted-foreground text-xs">
              Author: {{ settingsStore.colorTheme.author }}
            </p>
          </div>
        </div>
      </SettingRow>
    </SettingsSection>

    <Separator />

    <SettingsSection>
      <SettingRow
        :title="$t('settings_panel.themes.binary_editor_theme.label')"
        :description="$t('settings_panel.themes.binary_editor_theme.description')"
      >
        <SettingSelect
          v-model="settingsStore.hexViewerConfig.theme"
          :placeholder="$t('settings_panel.themes.binary_editor_theme.default')"
          :options="binaryEditorThemes"
        />
      </SettingRow>

      <SettingRow
        :title="$t('settings_panel.themes.zoom_ratio.label')"
        :description="$t('settings_panel.themes.zoom_ratio.description')"
      >
        <div class="flex w-full max-w-56 gap-0 overflow-hidden rounded-lg border">
          <SettingAction
            variant="secondary"
            size="icon"
            class="rounded-none"
            aria-label="Increase zoom"
            @click="settingsStore.changeZoom(0.1)"
          >
            <Plus />
          </SettingAction>
          <SettingInput
            v-model="settingsStore.zoomRatio"
            class="min-w-0 flex-1 rounded-none border-none text-center hover:ring-0"
          />
          <SettingAction
            variant="secondary"
            size="icon"
            class="rounded-none"
            aria-label="Decrease zoom"
            @click="settingsStore.changeZoom(-0.1)"
          >
            <Minus />
          </SettingAction>
        </div>
      </SettingRow>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Minus, Palette, RotateCcw } from "@lucide/vue";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "vue-sonner";

import Separator from "@/components/ui/separator/Separator.vue";
import {
  SettingAction,
  SettingInput,
  SettingRow,
  SettingSelect,
  SettingSlider,
  SettingsPageHeader,
  SettingsSection,
} from "@/components/settings/components";
import { useSettingsStore, loadColorTheme } from "@/stores/useSettingsStore";
import { applyColorTheme } from "@/services/colorTheme";

const settingsStore = useSettingsStore();
const { t } = useI18n();

const opacitySlider = computed({
  get: () => [settingsStore.backgroundImageConfig.opacity],
  set: (value: number[]) => {
    if (value.length > 0) {
      settingsStore.backgroundImageConfig.opacity = value[0];
    }
  },
});

const blurSlider = computed({
  get: () => [settingsStore.backgroundImageConfig.blur],
  set: (value: number[]) => {
    if (value.length > 0) {
      settingsStore.backgroundImageConfig.blur = value[0];
    }
  },
});

const binaryEditorThemes = computed(() => [
  {
    label: `Dark (${t("settings_panel.themes.binary_editor_theme.default")})`,
    value: "dark",
    group: "dark",
    groupLabel: t("settings_panel.themes.binary_editor_theme.dark_themes"),
  },
  {
    label: "Terminal",
    value: "terminal",
    group: "dark",
    groupLabel: t("settings_panel.themes.binary_editor_theme.dark_themes"),
  },
  {
    label: "Sunset",
    value: "sunset",
    group: "dark",
    groupLabel: t("settings_panel.themes.binary_editor_theme.dark_themes"),
  },
  {
    label: "Light",
    value: "light",
    group: "light",
    groupLabel: t("settings_panel.themes.binary_editor_theme.light_themes"),
  },
]);

const isImporting = ref(false);

async function importColorTheme(): Promise<void> {
  const filePath = await open({
    multiple: false,
    filters: [{ name: "LigHTTP Theme", extensions: ["lhtheme.css"] }],
  });

  if (typeof filePath !== "string") {
    return;
  }

  isImporting.value = true;

  try {
    const cssContent = await readTextFile(filePath);
    const theme = loadColorTheme(cssContent);
    settingsStore.setColorTheme(cssContent);
    applyColorTheme(theme.css);
    toast.success(`已成功套用主題：${theme.name}`);
  } catch (error) {
    console.error("Failed to import color theme:", error);
    toast.error(
      error instanceof Error
        ? `主題匯入失敗：${error.message}`
        : "主題匯入失敗",
    );
  } finally {
    isImporting.value = false;
  }
}

function resetColorTheme(): void {
  settingsStore.setColorTheme(null);
  applyColorTheme(null);
  toast.success("已恢復預設主題");
}
</script>
