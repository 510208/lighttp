<template>
  <div class="px-10 py-2">
    <div class="h-full overflow-x-hidden overflow-y-auto rounded-lg">
      <Table class="h-full w-full table-fixed overflow-y-scroll">
        <TableHeader>
          <TableRow class="border-ctp-surface1">
            <TableHead class="w-1/2">鍵</TableHead>
            <TableHead class="w-1/2">值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- 列出所有標頭 -->
          <TableRow
            v-for="(value, key) in responseStore.headers"
            :key="key"
            class="border-ctp-surface1"
          >
            <TableCell class="w-1/2 break-words">{{
              parseHeaderKey(key)
            }}</TableCell>
            <TableCell class="w-1/2 break-words">{{ value }}</TableCell>
          </TableRow>
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
  TableCell,
} from "@/components/ui/table";
import { useResponseStore } from "@/stores/useResponseStore";

const responseStore = useResponseStore();

function parseHeaderKey(key: string): string {
  return key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}
</script>

<style scoped></style>
