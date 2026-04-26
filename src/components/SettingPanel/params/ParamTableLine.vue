<template>
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
  >
    <TableCell class="text-center">
      <Checkbox
        :default-value="props.enabled"
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
        @click="requestStore.removeParam($props.param)"
      >
        <Trash class="text-ctp-red" :size="16" />
      </Button>
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
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

const handleToggle = () => {
  // 直接傳 ID 給 Store 處理
  requestStore.toggleParam(props.id);
};
</script>
