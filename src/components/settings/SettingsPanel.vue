<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <slot name="settings" />
    </DialogTrigger>
    <DialogContent
      class="h-[calc(100%-4rem)] max-h-[600px] min-h-[60vh] w-[60vw] min-w-fit p-0 sm:max-w-[1000px]"
    >
      <Tabs class="flex h-full flex-row">
        <TabsList
          class="bg-ctp-surface0 border-ctp-surface1 flex h-full w-[220px] flex-col items-stretch justify-start gap-1 overflow-y-auto rounded-none border-r px-3 py-4"
        >
          <DialogTitle class="mb-4 ml-2 text-lg font-semibold">
            {{ $t("settings_panel.title") }}
          </DialogTitle>
          <TabsTrigger value="general" class="sh-settings-tab">
            <Settings />{{ $t("settings_panel.tabs.general") }}
          </TabsTrigger>
          <TabsTrigger value="themes" class="sh-settings-tab">
            <Palette />{{ $t("settings_panel.tabs.themes") }}
          </TabsTrigger>
        </TabsList>

        <div class="h-full flex-1 p-6">
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="themes">
            <ThemesSettings />
          </TabsContent>
        </div>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { computed, onMounted } from "vue";
import { Settings, Palette } from "@lucide/vue";
import { useSettingsStore } from "@/stores/useSettingsStore";
import GeneralSettings from "./pages/GeneralSettings.vue";
import ThemesSettings from "./pages/ThemesSettings.vue";

const settingsStore = useSettingsStore();

onMounted(async () => {
  await settingsStore.$tauri.start();
  settingsStore.setLanguage(await settingsStore.language);
});

const props = defineProps<{ open?: boolean }>();
const emit = defineEmits(["update:open"]);

const isOpen = computed({
  get: () => props.open ?? false,
  set: (v: boolean) => emit("update:open", v),
});
</script>
