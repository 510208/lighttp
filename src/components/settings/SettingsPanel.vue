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
            <h2 class="text-lg font-semibold">
              {{ $t("settings_panel.general.title") }}
            </h2>

            <div class="mt-4 space-y-4">
              <div
                class="flex flex-col items-center gap-2 space-x-4 sm:flex-row"
              >
                <div class="flex flex-col gap-1">
                  <Label class="w-32 text-sm">{{
                    $t("settings_panel.tabs.general.language.label")
                  }}</Label>
                  <p class="text-muted-foreground text-sm">
                    {{ $t("settings_panel.tabs.general.language.description") }}
                  </p>
                </div>
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
              </div>
            </div>
          </TabsContent>
          <TabsContent value="themes">
            <h2 class="text-lg font-semibold">
              {{ $t("settings_panel.themes.title") }}
            </h2>
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
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/i18n";

const settingsStore = useSettingsStore();
const language = computed({
  get: () => settingsStore.language,
  set: (v: string) => settingsStore.setLanguage(v),
});

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
