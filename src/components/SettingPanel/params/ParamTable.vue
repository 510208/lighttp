<template>
  <div class="w-full">
    <Table class="w-full table-fixed">
      <TableHeader>
        <TableRow class="hover:bg-transparent border-ctp-surface2">
          <TableHead class="w-12 text-center">
            <Check class="mx-auto text-ctp-subtext1" :size="16" />
          </TableHead>
          <TableHead class="w-1/2">參數</TableHead>
          <TableHead class="w-1/2">數值</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <ParamTableLine
          v-for="i in 3"
          :key="i"
          :enabled="true"
          :param="'param' + i"
          :value="'value' + i"
        />
      </TableBody>
    </Table>
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
import { Check } from "@lucide/vue";
import ParamTableLine from "./ParamTableLine.vue";
</script>
