<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <slot name="settings" />
    </DialogTrigger>
    <DialogContent
      class="h-full max-h-[600px] min-h-[60vh] w-[60vw] min-w-[400px] p-0 sm:max-w-[1000px]"
    >
      <Tabs class="flex h-full flex-row">
        <TabsList
          class="bg-ctp-surface0 border-ctp-surface1 flex h-full w-[220px] flex-col items-stretch justify-start gap-1 overflow-y-auto rounded-none border-r px-3 py-4"
        >
          <TabsTrigger value="general" class="sh-settings-tab">
            <Settings />一般
          </TabsTrigger>
          <TabsTrigger value="themes" class="sh-settings-tab">
            <Palette />主題
          </TabsTrigger>
        </TabsList>

        <div class="h-full flex-1 p-6">
          <TabsContent value="general">
            <h2 class="text-lg font-semibold">一般設定</h2>

            <div class="mt-4 space-y-4">
              <div class="flex items-center gap-2 space-x-4">
                <Label class="w-32 text-sm">介面語言</Label>
                <Select v-model="language">
                  <SelectTrigger class="w-32">
                    <SelectValue placeholder="選擇語言" />
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
            <h2 class="text-lg font-semibold">主題設定</h2>
          </TabsContent>
        </div>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
