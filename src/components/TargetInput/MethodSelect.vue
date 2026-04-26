<template>
  <Select v-model="requestStore.method">
    <SelectTrigger
      class="min-h-12.5 min-w-[70px] border-none rounded-none bg-ctp-surface0 hover:bg-ctp-surface1 focus:ring-2 focus:ring-ctp-surface2"
      :class="currentTriggerColor"
    >
      <div class="flex flex-col items-start gap-1">
        <p class="text-[10px] text-muted-foreground tracking-[1px]">請求類型</p>
        <!-- 這裡確保 SelectValue 繼承父層顏色，或直接給它 font-bold -->
        <SelectValue class="font-bold font-space" />
      </div>
    </SelectTrigger>

    <SelectContent
      class="bg-ctp-surface0 border border-ctp-surface2 rounded-lg"
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
import { useRequestStore } from "@/stores/useRequestStore";

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
  GET: "text-ctp-green",
  POST: "text-ctp-peach",
  OPTIONS: "text-ctp-mauve",
  DELETE: "text-ctp-red",
  HEAD: "text-ctp-blue",
  PATCH: "text-ctp-yellow",
  PUT: "text-ctp-teal",
};

// 根據選中的值動態回傳顏色 class
const currentTriggerColor = computed(() => {
  return methodColors[requestStore.method as Method] || methodColors.NONE;
});
</script>
