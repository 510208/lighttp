<template>
  <div class="flex flex-col gap-4 w-full min-h-ui">
    <div class="flex gap-2">
      <Button variant="outline" class="w-auto gap-2" @click="$emit('add')">
        <Plus :size="16" />{{ addButtonText }}
      </Button>
      <slot name="extra"></slot>
    </div>

    <div
      class="max-h-60 overflow-x-hidden overflow-y-auto border rounded-lg border-ctp-surface1"
    >
      <Table class="w-full table-fixed">
        <TableHeader class="sticky top-0 bg-ctp-crust z-10">
          <TableRow class="hover:bg-transparent border-ctp-surface1">
            <TableHead class="w-12 text-center">
              <Check class="mx-auto text-ctp-subtext1" :size="16" />
            </TableHead>
            <TableHead class="w-1/2">{{ keyTitle }}</TableHead>
            <TableHead class="w-1/2">{{ valueTitle }}</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <slot></slot>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { Check, Plus } from "@lucide/vue";
import Button from "@/components/ui/button/Button.vue";

interface Props {
  addButtonText: string;
  keyTitle: string;
  valueTitle: string;
}

defineProps<Props>();
defineEmits(["add"]);
</script>
