<template>
  <div class="flex h-full w-full flex-col gap-4 p-1">
    <p class="font-bold">基本認證設定</p>
    <div class="flex flex-col">
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">使用者名稱</span>
        <Input v-model="username" placeholder="username" class="w-full" />
      </div>
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">密碼</span>
        <Input
          v-model="password"
          placeholder="password"
          type="password"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/useRequestStore";
import { computed } from "vue";
import { type BasicAuthContent } from "@/stores/authType";

const requestStore = useRequestStore();

// 使用 Computed 進行雙向綁定，直接存取 Store 內的 content
const username = computed({
  get: () => (requestStore.auth.content as BasicAuthContent).username || "",
  set: (val) => {
    (requestStore.auth.content as BasicAuthContent).username = val;
  },
});

const password = computed({
  get: () => (requestStore.auth.content as BasicAuthContent).password || "",
  set: (val) => {
    (requestStore.auth.content as BasicAuthContent).password = val;
  },
});
</script>
