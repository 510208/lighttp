<template>
  <ConfigLoader />
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <slot name="settings" />
    </DialogTrigger>
    <DialogContent
      class="h-[calc(100%-4rem)] max-h-[600px] min-h-[60vh] w-[85vw] min-w-fit p-0 sm:max-w-[1000px]"
    >
      <Tabs class="flex h-full flex-row">
        <TabsList
          class="bg-lh-surface-0 border-lh-surface-1 flex h-full w-[180px] flex-col items-stretch justify-start gap-1 overflow-y-auto rounded-none border-r px-3 py-4 lg:w-[220px]"
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
          <TabsTrigger value="define_gen" class="sh-settings-tab">
            <Hash />{{ $t("settings_panel.tabs.define_gen") }}
          </TabsTrigger>
          <TabsTrigger value="update" class="sh-settings-tab">
            <CircleFadingArrowUp />{{ $t("settings_panel.tabs.update") }}
          </TabsTrigger>
        </TabsList>

        <div class="h-full flex-1 overflow-auto p-6">
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="themes">
            <ThemesSettings />
          </TabsContent>
          <TabsContent value="define_gen">
            <DefineGenSettings />
          </TabsContent>
          <TabsContent value="update">
            <UpdateSettings />
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
import { computed } from "vue";
import { Settings, Palette, Hash, CircleFadingArrowUp } from "@lucide/vue";
import GeneralSettings from "./pages/GeneralSettings.vue";
import ThemesSettings from "./pages/ThemesSettings.vue";
import DefineGenSettings from "./pages/DefineGenSettings.vue";
import UpdateSettings from "./pages/UpdateSettings.vue";

import ConfigLoader from "@/components/core/ConfigLoader.vue";

const props = defineProps<{ open?: boolean }>();
const emit = defineEmits(["update:open"]);

const isOpen = computed({
  get: () => props.open ?? false,
  set: (v: boolean) => emit("update:open", v),
});
</script>
