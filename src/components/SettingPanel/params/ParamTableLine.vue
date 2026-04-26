<template>
  <!-- 如果被取消勾選，就為這行TableRow加上data-disabled屬性 -->
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
    :data-disabled="!isEnabled"
    :data-param-id="props.id"
  >
    <TableCell class="text-center">
      <Checkbox
        :default-value="props.enabled"
        v-model="isEnabled"
        @update:modelValue="handleToggle"
        class="border-ctp-overlay0"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input :default-value="$props.param" class="border-none" />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input :default-value="$props.value" class="border-none" />
    </TableCell>

    <!-- Action Buttons -->
    <TableCell>
      <Button
        variant="destructive"
        size="icon"
        @click="requestStore.removeParam($props.id)"
      >
        <Trash class="text-ctp-red" :size="16" />
      </Button>
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui/button/Button.vue";
import { Trash } from "@lucide/vue";

import { useRequestStore } from "@/stores/useRequestStore";
const requestStore = useRequestStore();

interface Props {
  id: string; // 增加 ID
  enabled: boolean;
  param: string;
  value: string;
}
const props = defineProps<Props>();

const isEnabled = ref(props.enabled);

const handleToggle = () => {
  // 直接傳 ID 給 Store 處理
  requestStore.toggleParam(props.id);
};
</script>

<style scoped>
/* 當 data-disabled 為 true 時，套用淡化效果 */
[data-disabled="true"] {
  opacity: 0.5;
  transition: opacity 0.3s ease;

  /* 輸入框內的文字加上刪除線 */
  & input {
    text-decoration: line-through;
    transition: text-decoration 0.3s ease;
  }
}

[data-disabled="false"] {
  opacity: 1;
  transition: opacity 0.3s ease;

  & input {
    text-decoration: none;
    transition: text-decoration 0.3s ease;
  }
}
</style>
