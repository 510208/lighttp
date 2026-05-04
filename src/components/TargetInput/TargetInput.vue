<script setup lang="ts">
import MethodSelect from "@/components/TargetInput/MethodSelect.vue";
import { useRequestStore } from "@/stores/useRequestStore";
import { Request } from "@/services";

import { SendHorizontal } from "@lucide/vue";
import { Button } from "@/components/ui/button";

const requestStore = useRequestStore();

function handleUrlBlur() {
  const url = requestStore.url.trim();

  // 如果輸入框為空，則不做處理
  if (!url) return;

  // 正則表達式檢查：是否以 http:// 或 https:// 開頭 (忽略大小寫)
  const protocolRegex = /^(http|https):\/\//i;

  if (!protocolRegex.test(url)) {
    // 如果沒有通訊協定，自動加上 http://
    requestStore.url = `http://${url}`;
    console.log("[LigHTTP] URL 補全為:", requestStore.url);
  }
}

function handleEnter() {
  handleUrlBlur(); // 先確保 URL 補全
  Request.handleSend();
}
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
      @keyup.enter="handleEnter"
      @blur="handleUrlBlur"
    />
    <Button
      @click="Request.handleSend"
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
