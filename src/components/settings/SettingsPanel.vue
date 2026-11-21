<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <slot name="settings" />
    </DialogTrigger>

    <DialogContent class="lh-settings-dialog">
      <Tabs class="lh-settings-layout">
        <TabsList class="lh-settings-sidebar">
          <div class="lh-settings-heading">
            <DialogTitle class="lh-settings-title">
              {{ $t("settings_panel.title") }}
            </DialogTitle>
            <p class="lh-settings-version">LigHTTP · 0.6.1</p>
          </div>

          <TabsTrigger value="general" class="sh-settings-tab">
            <Settings class="lh-settings-tab-icon" />
            {{ $t("settings_panel.tabs.general") }}
          </TabsTrigger>
          <TabsTrigger value="themes" class="sh-settings-tab">
            <Palette class="lh-settings-tab-icon" />
            {{ $t("settings_panel.tabs.themes") }}
          </TabsTrigger>
          <TabsTrigger value="define_gen" class="sh-settings-tab">
            <Hash class="lh-settings-tab-icon" />
            {{ $t("settings_panel.tabs.define_gen") }}
          </TabsTrigger>
          <TabsTrigger value="update" class="sh-settings-tab">
            <CircleFadingArrowUp class="lh-settings-tab-icon" />
            {{ $t("settings_panel.tabs.update") }}
          </TabsTrigger>
        </TabsList>

        <main class="lh-settings-content">
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
        </main>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import GeneralSettings from "./pages/GeneralSettings.vue";
import ThemesSettings from "./pages/ThemesSettings.vue";
import DefineGenSettings from "./pages/DefineGenSettings.vue";
import UpdateSettings from "./pages/UpdateSettings.vue";

const props = defineProps<{ open?: boolean }>();
const emit = defineEmits(["update:open"]);

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit("update:open", value),
});
</script>
