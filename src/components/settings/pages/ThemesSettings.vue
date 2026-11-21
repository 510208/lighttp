<template>
  <div class="lh-settings-page">
    <SettingsPageHeader :title="$t('settings_panel.themes.title')" />

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
      <ConfigOptionFrame
        label-key="settings_panel.themes.background_image_opacity.label"
        description-key="settings_panel.themes.background_image_opacity.description"
      >
        <Slider
          v-model="opacitySlider"
          :min="0"
          :max="1"
          :step="0.01"
          class="w-70"
        />
      </ConfigOptionFrame>
      <ConfigOptionFrame
        label-key="settings_panel.themes.background_image_blur.label"
        description-key="settings_panel.themes.background_image_blur.description"
      >
        <Slider
          v-model="blurSlider"
          :min="0"
          :max="30"
          :step="1"
          class="w-70"
        />
      </ConfigOptionFrame>

      <Separator />

      <ConfigOptionFrame
        label-key="settings_panel.themes.color_theme.label"
        description-key="settings_panel.themes.color_theme.description"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <Button @click="importColorTheme" :disabled="isImporting">
              <Palette class="mr-2 size-4" />
              {{ isImporting ? "匯入中..." : "匯入主題" }}
            </Button>

            <Button variant="outline" @click="resetColorTheme">
              <RotateCcw class="mr-2 size-4" />
              恢復預設
            </Button>
          </div>

          <div class="space-y-1 rounded-lg border p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold">
                {{ settingsStore.colorTheme.name }}
              </p>

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
              Dark ({{
                $t("settings_panel.themes.binary_editor_theme.default")
              }})
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

      <Separator />

      <ConfigOptionFrame
        label-key="settings_panel.themes.zoom_ratio.label"
        description-key="settings_panel.themes.zoom_ratio.description"
      >
        <div class="flex gap-0 overflow-hidden rounded-lg border">
          <Button
            @click="settingsStore.changeZoom(0.1)"
            variant="secondary"
            size="icon"
            class="rounded-none"
          >
            <Plus />
          </Button>
          <Input
            v-model="settingsStore.zoomRatio"
            class="flex-1 rounded-none border-none hover:ring-0"
          />
          <Button
            @click="settingsStore.changeZoom(-0.1)"
            variant="secondary"
            size="icon"
            class="rounded-none"
          >
            <Minus />
          </Button>
        </div>
      </ConfigOptionFrame>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";
import Separator from "@/components/ui/separator/Separator.vue";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

import { Slider } from "@/components/ui/slider";
import { Plus, Minus, Palette, RotateCcw } from "@lucide/vue";

import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "vue-sonner";

import { useSettingsStore, loadColorTheme } from "@/stores/useSettingsStore";
import { applyColorTheme } from "@/services/colorTheme";

const settingsStore = useSettingsStore();

// ============================================================
// 背景圖片設定
// ============================================================

// 透明度
const opacitySlider = computed({
  get: () => [settingsStore.backgroundImageConfig.opacity],
  set: (val: number[]) => {
    if (val && val.length > 0) {
      settingsStore.backgroundImageConfig.opacity = val[0];
    }
  },
});

// 模糊
const blurSlider = computed({
  get: () => [settingsStore.backgroundImageConfig.blur],
  set: (val: number[]) => {
    if (val && val.length > 0) {
      settingsStore.backgroundImageConfig.blur = val[0];
    }
  },
});

// ============================================================
// 色彩主題設定
// ============================================================

const isImporting = ref(false);

/**
 * 匯入主題檔案。
 */
async function importColorTheme(): Promise<void> {
  const filePath = await open({
    multiple: false,
    filters: [
      {
        name: "LigHTTP Theme",
        extensions: ["lhtheme.css"],
      },
    ],
  });

  if (typeof filePath !== "string") {
    return;
  }

  isImporting.value = true;

  try {
    const cssContent = await readTextFile(filePath);

    // 驗證主題 Metadata
    const theme = loadColorTheme(cssContent);

    // 更新設定並即時套用主題
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

/**
 * 恢復預設主題。
 */
function resetColorTheme(): void {
  settingsStore.setColorTheme(null);
  applyColorTheme(null);

  toast.success("已恢復預設主題");
}
</script>
