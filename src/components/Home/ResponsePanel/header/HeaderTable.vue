<template>
  <div class="flex h-full min-h-0 flex-col px-10 py-2">
    <div class="h-full overflow-x-hidden overflow-y-auto rounded-lg">
      <Table class="h-full w-full table-fixed overflow-y-scroll">
        <TableHeader>
          <TableRow class="border-lh-surface-1">
            <TableHead>{{
              $t("home.response_panel.header_table.key_header")
            }}</TableHead>
            <TableHead>{{
              $t("home.response_panel.header_table.value_header")
            }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- 外層走訪所有 Header Key 與對應的值（可能是字串或陣列） -->
          <template v-for="(values, key) in responseStore.headers" :key="key">
            <!-- 內層走訪展平後的純字串值，重複 Key 會拆解為獨立的表格列 -->
            <TableRow
              v-for="(value, index) in normalizeHeaderValues(values)"
              :key="`${key}-${index}`"
              class="border-lh-surface-1"
            >
              <TableCell class="break-words">
                <HoverCard
                  v-if="getHeaderTemplate(String(key))"
                  class="inline-block"
                >
                  <HoverCardTrigger
                    class="border-lh-text-subtle cursor-help border-b border-dotted"
                  >
                    {{ parseHeaderKey(String(key)) }}
                  </HoverCardTrigger>
                  <HoverCardContent class="w-auto max-w-sm" align="start">
                    <div class="space-y-2">
                      <p class="text-sm font-semibold">
                        {{ parseHeaderKey(String(key)) }}
                      </p>
                      <p
                        class="text-lh-text-subtle text-sm whitespace-pre-wrap"
                      >
                        {{ getHeaderTemplate(String(key))?.description }}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <span v-else>{{ parseHeaderKey(String(key)) }}</span>
              </TableCell>

              <TableCell class="flex items-center gap-1 font-mono">
                {{ breakLongValue(value) }}
                <HoverCard v-if="value.length > 40" class="inline-block">
                  <HoverCardTrigger
                    class="text-lh-text-subtle ml-2 text-sm"
                    @click="copyToClipboard(value)"
                  >
                    <div class="bg-lh-surface-1 rounded border px-1">
                      <Ellipsis :size="16" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent class="w-auto max-w-xs">
                    <pre
                      class="font-mono break-words whitespace-pre-wrap text-white"
                      >{{ value }}</pre
                    >
                    <Separator class="my-2" />
                    <p class="text-lh-text-subtle text-sm">
                      {{ $t("home.response_panel.header_table.copy_hint") }}
                    </p>
                  </HoverCardContent>
                </HoverCard>
                <!-- 顯示最後一個字 -->
                {{ value.length > 41 ? value.slice(-1) : "" }}
              </TableCell>
            </TableRow>
          </template>
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
import { useResponseStore } from "@/stores/useResponseStore.ts";
import {
  headerTemplates,
  type HeaderTemplate,
} from "@/constants/headerTemplates.ts";
import { Ellipsis } from "@lucide/vue";
import { toast } from "vue-sonner";
import Separator from "../../../ui/separator/Separator.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const responseStore = useResponseStore();

/**
 * 將 string | string[] 統一正規化為 string[]
 */
function normalizeHeaderValues(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

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
      toast.success(t("home.response_panel.header_table.toast.copy_success"));
    },
    (_err) => {
      toast.error(t("home.response_panel.header_table.toast.copy_error"));
    },
  );
}

function getHeaderTemplate(key: string): HeaderTemplate | undefined {
  return headerTemplates.find(
    (template) => template.key.toLowerCase() === key.toLowerCase(),
  );
}
</script>

<style scoped></style>
