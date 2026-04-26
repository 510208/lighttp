<template>
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
    :data-disabled="!isEnabled"
    :data-param-id="props.id"
  >
    <TableCell class="text-center">
      <Checkbox
        :checked="props.enabled"
        :default-value="props.enabled"
        @update:modelValue="handleToggle"
        class="border-ctp-overlay0"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input
        :model-value="props.param"
        :default-value="props.param"
        @input="
          (e: any) =>
            requestStore.updateParam(props.id, { key: e.target.value })
        "
        class="border-none bg-transparent focus-visible:ring-0"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input
        :model-value="props.value"
        :default-value="props.value"
        @input="
          (e: any) =>
            requestStore.updateParam(props.id, { value: e.target.value })
        "
        class="border-none bg-transparent focus-visible:ring-0"
      />
    </TableCell>

    <TableCell>
      <Button
        variant="destructive"
        size="icon"
        @click="requestStore.removeParam(props.id)"
      >
        <Trash class="text-ctp-red" :size="16" />
      </Button>
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui/button/Button.vue";
import { Trash } from "@lucide/vue";
import { useRequestStore } from "@/stores/useRequestStore";

const requestStore = useRequestStore();

interface Props {
  id: string;
  enabled: boolean;
  param: string;
  value: string;
}
const props = defineProps<Props>();

// 確保本地狀態與 Props 同步
const isEnabled = ref(props.enabled);
watch(
  () => props.enabled,
  (newVal) => {
    isEnabled.value = newVal;
  },
);

const handleToggle = () => {
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
