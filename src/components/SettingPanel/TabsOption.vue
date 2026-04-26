<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    class="flex items-center gap-2.5 justify-end border-none py-0.5 px-2"
  >
    <p class="text-sm font-medium">{{ name || value }}</p>
    <p class="text-[10px] text-ctp-text/20 font-light sh_tabs_chinese-name">
      {{ chineseName }}
    </p>
  </TabsTrigger>
</template>

<script setup lang="ts">
import { TabsTrigger } from "@/components/ui/tabs";

// 定義 TabsTrigger 組件的 props 類型
interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  name?: string;
  chineseName?: string;
}

// 定義組件的 props
const props = defineProps<TabsTriggerProps>();
</script>
