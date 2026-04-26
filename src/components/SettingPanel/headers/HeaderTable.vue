<template>
  <div class="w-full">
    <div
      class="max-h-[300px] overflow-y-auto border rounded-md border-ctp-surface2"
    >
      <Table class="w-full table-fixed">
        <TableHeader class="sticky top-0 bg-ctp-mantle z-10">
          <TableRow class="hover:bg-transparent border-ctp-surface2">
            <TableHead class="w-12 text-center">
              <Check class="mx-auto text-ctp-subtext1" :size="16" />
            </TableHead>
            <TableHead class="w-[40%] text-ctp-text font-bold">標頭</TableHead>
            <TableHead class="w-[45%] text-ctp-text font-bold">內容</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <HeaderTableLine
            v-for="item in requestStore.headers"
            :key="item.id"
            :id="item.id"
            :enabled="item.enabled"
            :header-key="item.key"
            :header-value="item.value"
          />
        </TableBody>
      </Table>
    </div>

    <button
      @click="requestStore.addHeader"
      class="mt-4 flex items-center gap-2 text-xs text-ctp-subtext0 hover:text-ctp-text transition-colors px-2 py-1"
    >
      <span class="text-lg">+</span>
      <span>新增 Header</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Check } from "@lucide/vue";
import { useRequestStore } from "@/stores/useRequestStore";
import HeaderTableLine from "./HeaderTableLine.vue";

const requestStore = useRequestStore();
</script>
