<template>
  <div class="flex h-full min-h-0 flex-col px-10 py-2">
    <div class="h-full overflow-x-hidden overflow-y-auto rounded-lg">
      <Table class="h-full w-full table-fixed overflow-y-scroll">
        <TableHeader>
          <TableRow class="border-ctp-surface1">
            <TableHead>鍵</TableHead>
            <TableHead>值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- 列出所有標頭 -->
          <TableRow
            v-for="(value, key) in responseStore.headers"
            :key="key"
            class="border-ctp-surface1"
          >
            <TableCell class="break-words">
              {{ parseHeaderKey(key) }}
            </TableCell>
            <TableCell class="flex items-center gap-1 font-mono">
              {{ breakLongValue(value) }}
              <HoverCard v-if="value.length > 40" class="inline-block">
                <HoverCardTrigger
                  class="text-ctp-text-subtle ml-2 text-sm"
                  @click="copyToClipboard(value)"
                >
                  <div class="bg-ctp-surface1 rounded border px-1">
                    <Ellipsis :size="16" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent class="w-auto max-w-xs">
                  <pre
                    class="font-mono break-words whitespace-pre-wrap text-white"
                    >{{ value }}</pre
                  >
                  <Separator class="my-2" />
                  <p class="text-ctp-text-subtle text-sm">
                    點擊下方按鈕可複製完整內容
                  </p>
                </HoverCardContent>
              </HoverCard>
            </TableCell>
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useResponseStore } from "@/stores/useResponseStore";
import { Ellipsis } from "@lucide/vue";

import { toast } from "vue-sonner";
import Separator from "@/components/ui/separator/Separator.vue";

const responseStore = useResponseStore();

function parseHeaderKey(key: string): string {
  return key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function breakLongValue(value: string): string {
  if (value.length > 40) {
    return value.slice(0, 40);
  }
  return value;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => {
      // 成功複製
      toast.success("已複製到剪貼簿");
    },
    (_err) => {
      // 複製失敗
      toast.error("複製失敗");
    },
  );
}
</script>

<style scoped></style>
