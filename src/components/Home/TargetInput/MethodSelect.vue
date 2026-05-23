<template>
  <Select v-model="requestStore.method">
    <SelectTrigger
      class="bg-lh-surface-0 hover:bg-lh-surface-1 focus:ring-lh-surface-2 min-h-12.5 min-w-[70px] rounded-none border-none focus:ring-2"
      :class="currentTriggerColor"
    >
      <div class="flex flex-col items-start gap-1">
        <p class="text-muted-foreground text-[10px] tracking-[1px]">
          {{ $t("home.target_input.method_select.label") }}
        </p>
        <!-- 這裡確保 SelectValue 繼承父層顏色，或直接給它 font-bold -->
        <SelectValue class="font-space font-bold" />
      </div>
    </SelectTrigger>

    <SelectContent
      class="bg-lh-surface-0 border-lh-surface-2 rounded-lg border"
    >
      <SelectGroup>
        <!-- 使用物件迴圈可以減少重複程式碼 -->
        <SelectItem
          v-for="(colorClass, method) in methodColors"
          :key="method"
          :value="method"
          :class="['font-space', colorClass]"
        >
          {{ method }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequestStore } from "@/stores/useRequestStore.ts";

const requestStore = useRequestStore();

type Method =
  | "NONE"
  | "GET"
  | "POST"
  | "OPTIONS"
  | "DELETE"
  | "HEAD"
  | "PATCH"
  | "PUT";

// 定義每個方法對應的顏色
const methodColors: Record<Method, string> = {
  NONE: "text-muted-foreground",
  GET: "text-lh-green",
  POST: "text-lh-peach",
  OPTIONS: "text-lh-mauve",
  DELETE: "text-lh-red",
  HEAD: "text-lh-blue",
  PATCH: "text-lh-yellow",
  PUT: "text-lh-teal",
};

// 根據選中的值動態回傳顏色 class
const currentTriggerColor = computed(() => {
  return methodColors[requestStore.method as Method] || methodColors.NONE;
});
</script>
