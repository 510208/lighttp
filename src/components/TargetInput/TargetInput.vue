<script setup lang="ts">
import MethodSelect from "@/components/TargetInput/MethodSelect.vue";
import { useRequestStore } from "@/stores/useRequestStore";

import { SendHorizontal } from "@lucide/vue";

import { Button } from "@/components/ui/button";

const requestStore = useRequestStore();

import { invoke } from "@tauri-apps/api/core";

// 處理發送邏輯 (未來對接 Rust 後端)
const handleSend = () => {
  if (requestStore.method === "NONE") {
    console.warn("未選擇 HTTP 方法，跳過請求");
    return;
  }

  console.log(`Sending ${requestStore.method} request to: ${requestStore.url}`);
  console.log("requestStore:", requestStore);
  console.log("Request Content:", requestStore.getRequestData());

  // 發送請求到 Rust 後端
  invoke("handle_request", { payload: requestStore.getRequestData() })
    .then((response) => {
      console.log("Response from Rust:", response);
    })
    .catch((error) => {
      console.error("Error invoking Rust command:", error);
    });
};
</script>

<template>
  <div
    class="bg-ctp-base border-ctp-surface0 focus-within:border-ctp-surface2 flex flex-1 items-stretch overflow-hidden rounded-lg border transition-colors duration-200"
  >
    <MethodSelect />
    <input
      v-model="requestStore.url"
      type="text"
      placeholder="Enter URL or paste text"
      class="flex-1 bg-transparent px-4 py-2 text-sm text-[#cdd6f4] placeholder-[#6c7086] outline-none"
      @keyup.enter="handleSend"
    />
    <Button
      @click="handleSend"
      class="text-ctp-subtext0 bg-ctp-surface0 hover:bg-ctp-surface2 min-h-12.5 w-24 cursor-pointer rounded-none px-6 py-2 text-base font-bold transition-all"
    >
      送出
      <SendHorizontal />
    </Button>
  </div>
</template>

<style scoped>
/* 隱藏原生 Select 的箭頭（針對不同瀏覽器） */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 修正 Select 在深色模式下的選項背景 */
option {
  background-color: #1e1e2e;
  color: #cdd6f4;
}
</style>
