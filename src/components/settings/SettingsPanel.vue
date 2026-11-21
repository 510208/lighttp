<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <slot name="settings" />
    </DialogTrigger>

    <DialogContent class="lh-settings-dialog !max-w-[1200px]">
      <SettingsLayout>
        <template #sidebar>
          <SettingsSidebar v-model="activeSection" :items="navigation">
            <template #header>
              <div class="lh-settings-heading">
                <DialogTitle class="lh-settings-title">
                  {{ $t("settings_panel.title") }}
                </DialogTitle>
                <p class="lh-settings-version">LigHTTP · {{ version }}</p>
              </div>
            </template>
          </SettingsSidebar>
        </template>

        <template #content>
          <SettingsContent>
            <component :is="pages[activeSection]" />
          </SettingsContent>
        </template>
      </SettingsLayout>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Component } from "vue";
import {
  CircleFadingArrowUp,
  Hash,
  Palette,
  Settings,
} from "@lucide/vue";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SettingsContent,
  SettingsLayout,
  SettingsSidebar,
} from "./layout";
import type { SettingsNavigationItem } from "./layout";
import GeneralSettings from "./pages/GeneralSettings.vue";
import ThemesSettings from "./pages/ThemesSettings.vue";
import DefineGenSettings from "./pages/DefineGenSettings.vue";
import UpdateSettings from "./pages/UpdateSettings.vue";
import { getVersion } from "@tauri-apps/api/app";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    section?: string;
    defaultSection?: string;
  }>(),
  {
    defaultSection: "general",
  },
);

const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
  (event: "update:section", value: string): void;
}>();

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit("update:open", value),
});

const internalSection = ref(props.defaultSection);
const activeSection = computed({
  get: () => props.section ?? internalSection.value,
  set: (value: string) => {
    internalSection.value = value;
    emit("update:section", value);
  },
});

const { t } = useI18n();
const navigation: SettingsNavigationItem[] = [
  { value: "general", label: t("settings_panel.tabs.general"), icon: Settings },
  { value: "themes", label: t("settings_panel.tabs.themes"), icon: Palette },
  { value: "define_gen", label: t("settings_panel.tabs.define_gen"), icon: Hash },
  { value: "update", label: t("settings_panel.tabs.update"), icon: CircleFadingArrowUp },
];

const pages: Record<string, Component> = {
  general: GeneralSettings,
  themes: ThemesSettings,
  define_gen: DefineGenSettings,
  update: UpdateSettings,
};

const version = ref("???");

onMounted(async () => {
  try {
    version.value = await getVersion();
  } catch (error) {
    console.error("Failed to get application version:", error);
  }
});
</script>
