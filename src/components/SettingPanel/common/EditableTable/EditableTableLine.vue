<template>
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
    :data-disabled="!enabled"
  >
    <TableCell class="text-center">
      <Checkbox
        :checked="enabled"
        @update:checked="$emit('toggle')"
        class="border-ctp-overlay0"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text p-0">
      <Input
        :model-value="keyName"
        @input="(e: any) => $emit('update:keyName', e.target.value)"
        class="border-none bg-transparent focus-visible:ring-0 w-full"
        :placeholder="keyPlaceholder"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text p-0">
      <Input
        :model-value="valueContent"
        @input="(e: any) => $emit('update:valueContent', e.target.value)"
        class="border-none bg-transparent focus-visible:ring-0 w-full"
        :placeholder="valuePlaceholder"
      />
    </TableCell>

    <TableCell class="text-center">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 hover:bg-ctp-surface1"
        @click="$emit('remove')"
      >
        <Trash class="text-ctp-red opacity-80 hover:opacity-100" :size="16" />
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

interface Props {
  enabled: boolean;
  keyName: string;
  valueContent: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

defineProps<Props>();
defineEmits(["toggle", "remove", "update:keyName", "update:valueContent"]);
</script>

<style scoped>
[data-disabled="true"] {
  opacity: 0.5;
  filter: grayscale(0.5);
  & input {
    text-decoration: line-through;
  }
}
</style>
