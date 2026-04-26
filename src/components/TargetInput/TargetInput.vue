<script setup lang="ts">
import { useRequestStore } from "@/stores/useRequestStore";

const requestStore = useRequestStore();
const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

// 處理發送邏輯 (未來對接 Rust 後端)
const handleSend = () => {
  console.log(`Sending ${requestStore.method} request to: ${requestStore.url}`);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <div
      class="flex flex-1 items-center bg-[#1e1e2e] rounded-lg border border-[#313244] focus-within:border-[#b4befe] transition-colors duration-200"
    >
      <div class="relative px-3 border-r border-[#313244]">
        <select
          v-model="requestStore.method"
          class="bg-transparent text-[#a6e3a1] font-bold text-sm outline-none cursor-pointer appearance-none py-2 pr-4 uppercase"
        >
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>
        <div
          class="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[#a6e3a1] text-[10px]"
        >
          ▼
        </div>
      </div>

      <input
        v-model="requestStore.url"
        type="text"
        placeholder="Enter URL or paste text"
        class="bg-transparent outline-none flex-1 px-4 py-2 text-sm text-[#cdd6f4] placeholder-[#6c7086]"
        @keyup.enter="handleSend"
      />
    </div>

    <button
      @click="handleSend"
      class="bg-[#b4befe] hover:bg-[#cba6f7] text-[#11111b] font-bold px-6 py-2 rounded-lg transition-all active:scale-95 text-sm cursor-pointer"
    >
      Send
    </button>
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
