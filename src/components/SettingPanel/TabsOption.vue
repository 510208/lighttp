<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    class="flex items-center justify-end gap-2.5 border-none px-2 py-0.5"
  >
    <p class="text-sm font-medium">{{ name || value }}</p>
    <p class="text-ctp-text/20 sh_tabs_chinese-name text-[10px] font-light">
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
defineProps<TabsTriggerProps>();
</script>
