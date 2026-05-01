<template>
  <div class="flex h-full w-full flex-col gap-4 p-1">
    <p class="font-bold">Bearer Token</p>
    <div class="flex flex-col">
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">Token</span>
        <Input
          @input="updateAuth"
          v-model="token"
          placeholder="Bearer Token"
          class="w-full"
        />
        <span class="text-ctp-text text-sm">
          輸入 Bearer Token，請勿包含 "Bearer " 前綴。
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/useRequestStore";
import { ref } from "vue";

import { type BearerAuthContent } from "@/stores/authType";

const token = ref("");

function updateAuth() {
  requestStore.setAuth({
    type: "bearer",
    content: {
      token: token.value,
    } as BearerAuthContent,
  });
}

const requestStore = useRequestStore();
</script>

<style scoped></style>
