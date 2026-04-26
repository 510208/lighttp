<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex">
      <Button
        variant="outline"
        class="w-auto gap-2"
        @click="requestStore.addParam()"
      >
        <Plus />新增參數
      </Button>
    </div>
    <div class="max-h-60 overflow-x-hidden overflow-y-auto border rounded-lg">
      <Table class="w-full table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent border-ctp-surface2">
            <TableHead class="w-12 text-center">
              <Check class="mx-auto text-ctp-subtext1" :size="16" />
            </TableHead>
            <TableHead class="w-1/2">參數</TableHead>
            <TableHead class="w-1/2">值</TableHead>
            <TableHead class="w-1/2" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <ParamTableLine
            v-for="item in requestStore.params"
            :key="item.id"
            :id="item.id"
            :enabled="true"
            :param="item.key"
            :value="item.value"
          />
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
import ParamTableLine from "./ParamTableLine.vue";

import { useRequestStore } from "@/stores/useRequestStore";
import Button from "@/components/ui/button/Button.vue";
const requestStore = useRequestStore();
</script>
