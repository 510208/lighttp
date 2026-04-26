<template>
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
  >
    <TableCell class="text-center">
      <Checkbox :checked="props.enabled" class="border-ctp-overlay0" />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      {{ props.param }}
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      {{ props.value }}
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  enabled?: boolean;
  param: string;
  value: string;
}
const props = defineProps<Props>();
</script>
