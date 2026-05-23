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
    <Separator />
    <ConfigOptionFrame
      label-key="settings_panel.themes.theme_file.label"
      description-key="settings_panel.themes.theme_file.description"
    >
      <Input
        id="picture"
        type="file"
        accept=".css"
        @change="handleFileUpload"
      />
    </ConfigOptionFrame>
    <ConfigOptionFrame
      label-key="settings_panel.themes.current_theme.label"
      description-key="settings_panel.themes.current_theme.description"
    >
      <div
        class="bg-lh-surface-0 flex flex-1 flex-col gap-1 rounded border p-2"
        v-if="settingsStore.colorTheme.css"
      >
        <p class="text-sm">
          {{ settingsStore.colorTheme.name }}
        </p>
        <p class="text-muted-foreground text-sm">
          {{ settingsStore.colorTheme.description }}
        </p>
        <ol class="text-muted-foreground text-sm">
          <li>
            {{
              $t("settings_panel.themes.current_theme.author", {
                author: settingsStore.colorTheme.author,
              })
            }}
          </li>
          <li>
            {{
              $t("settings_panel.themes.current_theme.license", {
                license: settingsStore.colorTheme.license,
              })
            }}
          </li>
        </ol>
      </div>
      <p class="text-muted-foreground" v-else>
        {{ $t("settings_panel.themes.current_theme.no_custom") }}
      </p>
    </ConfigOptionFrame>
    <ConfigOptionFrame
      label-key="settings_panel.themes.reset_theme.label"
      description-key="settings_panel.themes.reset_theme.description"
    >
      <Button
        @click="resetColorTheme()"
        variant="destructive"
        :disabled="!themeIsCustom"
        ><RotateCcw />
        {{ $t("settings_panel.themes.reset_theme.reset_button_label") }}
      </Button>
    </ConfigOptionFrame>
  </div>
</template>

<script setup lang="ts">
import Input from "@/components/ui/input/Input.vue";
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";
import {
  useSettingsStore,
  loadColorTheme,
  ColorTheme,
} from "@/stores/useSettingsStore";
import Separator from "@/components/ui/separator/Separator.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import { computed } from "vue";
import { RotateCcw } from "@lucide/vue";

const settingsStore = useSettingsStore();
const themeIsCustom = computed(() => !!settingsStore.colorTheme.css);

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  // 確保有選擇文件
  if (!target.files || target.files.length === 0) {
    return;
  }

  const file = target.files[0];

  const reader = new FileReader();
  reader.onload = (e) => {
    const cssContent = e.target?.result as string;

    try {
      const themeObj = loadColorTheme(cssContent);
      settingsStore.colorTheme = themeObj;
      toast.success("CSS 文件已成功上傳！");
    } catch (error) {
      toast.error("CSS 文件格式無效！");
    }
  };

  reader.readAsText(file);
}

function resetColorTheme() {
  const defaultTheme = {
    name: "Mocha Theme",
    description: "The default Catppuccin Mocha theme for LigHTTP.",
    author: "SamHacker",
    license: "MIT",

    css: null,
  } as ColorTheme;
  settingsStore.colorTheme = defaultTheme;
  toast.success("主題已重置為預設！");
}
</script>
