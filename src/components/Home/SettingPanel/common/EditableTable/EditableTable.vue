<template>
  <div class="min-h-ui flex w-full flex-col gap-4">
    <div class="flex gap-2">
      <Button variant="outline" class="w-auto gap-2" @click="$emit('add')">
        <Plus :size="16" />{{ addButtonText }}
      </Button>
      <slot name="extra"></slot>
    </div>

    <div
      class="border-lh-surface-1 max-h-60 overflow-x-hidden overflow-y-auto rounded-lg border"
    >
      <Table class="w-full table-fixed">
        <TableHeader class="bg-lh-crust sticky top-0 z-10">
          <TableRow class="border-lh-surface-1 hover:bg-transparent">
            <TableHead class="w-12 text-center">
              <Check class="text-lh-subtext-1 mx-auto" :size="16" />
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
import Button from "../../../../ui/button/Button.vue";

interface Props {
  addButtonText: string;
  keyTitle: string;
  valueTitle: string;
}

defineProps<Props>();
defineEmits(["add"]);
</script>
