<template>
  <TableRow
    class="border-ctp-surface1 hover:bg-ctp-surface0/50 transition-colors"
    :data-disabled="!props.enabled"
    :data-param-enabled="props.enabled"
  >
    <TableCell class="text-center">
      <Checkbox
        :checked="props.enabled"
        @update:checked="requestStore.toggleHeader(props.id)"
        class="border-ctp-overlay0"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input
        :default-value="props.headerKey"
        class="border-none bg-transparent focus-visible:ring-0"
        placeholder="Header key"
      />
    </TableCell>

    <TableCell class="font-space text-sm text-ctp-text">
      <Input
        :default-value="props.headerValue"
        class="border-none bg-transparent focus-visible:ring-0"
        placeholder="Value"
      />
    </TableCell>

    <TableCell class="text-center">
      <Button
        variant="ghost"
        size="icon"
        class="hover:bg-ctp-surface1 h-8 w-8"
        @click="requestStore.removeHeader(props.id)"
      >
        <Trash class="text-ctp-red opacity-70 hover:opacity-100" :size="14" />
      </Button>
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash } from "@lucide/vue";
import { useRequestStore } from "@/stores/useRequestStore";

const requestStore = useRequestStore();

interface Props {
  id: string;
  enabled: boolean;
  headerKey: string;
  headerValue: string;
}
const props = defineProps<Props>();
</script>
