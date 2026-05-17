<template>
  <h2 class="text-lg font-semibold">
    {{ $t("settings_panel.define_gen.title") }}
  </h2>

  <div class="mt-4 space-y-4">
    <ConfigOptionFrame
      label-key="settings_panel.define_gen.indent.label"
      description-key="settings_panel.define_gen.indent.description"
    >
      <Select v-model="settingsStore.defaultIndentSize">
        <SelectTrigger class="w-32">
          <SelectValue
            :placeholder="$t('settings_panel.define_gen.indent.placeholder')"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tab">
              {{ $t("settings_panel.define_gen.indent.options.tab") }}
            </SelectItem>
            <SelectItem value="2">
              {{
                $t("settings_panel.define_gen.indent.options.spaces", {
                  count: 2,
                })
              }}
            </SelectItem>
            <SelectItem value="4">
              {{
                $t("settings_panel.define_gen.indent.options.spaces", {
                  count: 4,
                })
              }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </ConfigOptionFrame>
  </div>
</template>

<script setup lang="ts">
import ConfigOptionFrame from "@/components/settings/components/ConfigOptionFrame.vue";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsStore = useSettingsStore();
</script>

<style scoped></style>
