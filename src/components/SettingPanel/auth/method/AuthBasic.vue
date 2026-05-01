<template>
  <div class="flex h-full w-full flex-col gap-4 p-1">
    <p class="font-bold">基本認證設定</p>
    <div class="flex flex-col">
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">使用者名稱</span>
        <Input
          @input="updateAuth"
          v-model="username"
          placeholder="username"
          class="w-full"
        />
      </div>
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">密碼</span>
        <Input
          @input="updateAuth"
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
import { ref } from "vue";

import { type BasicAuthContent } from "@/stores/authType";

const username = ref("");
const password = ref("");

function updateAuth() {
  requestStore.setAuth({
    type: "basic",
    content: {
      username: username.value,
      password: password.value,
    } as BasicAuthContent,
  });
}

const requestStore = useRequestStore();
</script>

<style scoped></style>
