<script setup lang="ts">
import MethodSelect from "@/components/Home/TargetInput/MethodSelect.vue";
import { useRequestStore } from "@/stores/useRequestStore.ts";
import { Request } from "@/services";

import { SendHorizontal } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import hotkeys from "hotkeys-js";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { cn } from "@/lib/utils";

const requestStore = useRequestStore();
const inputColorClass = ref("border-lh-surface-0");

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
  // 檢查輸入框是否為空，如果是，則將輸入框邊線設為紅色，並顯示提示訊息
  if (!requestStore.url.trim()) {
    inputColorClass.value = "border-red-500";
    // 3秒後將邊線顏色恢復為原本的顏色
    handleTextboxTimeout();
    return;
  }
  handleUrlBlur(); // 先確保 URL 補全
  Request.handleSend();
}

async function handleTextboxTimeout() {
  // 等待3秒
  await new Promise((resolve) => setTimeout(resolve, 3000));

  inputColorClass.value = ""; // 顏色清空
}

onMounted(() => {
  hotkeys("ctrl+enter", (event) => {
    event.preventDefault();
    handleEnter();
  });
});

onUnmounted(() => {
  hotkeys.unbind();
});

// 監聽輸入框，當輸入框改變時，將邊線顏色恢復為原本的顏色
watch(
  () => requestStore.url,
  () => {
    inputColorClass.value = "border-lh-surface-0"; // 恢復原本的顏色\
  },
);
</script>

<template>
  <div
    :class="
      cn(
        'bg-lh-base border-lh-surface-0 focus-within:border-lh-surface-2 flex flex-1 items-stretch overflow-hidden rounded-lg border transition-colors duration-200',
        inputColorClass,
      )
    "
  >
    <MethodSelect />
    <input
      v-model="requestStore.url"
      type="text"
      :placeholder="$t('home.target_input.url_input.placeholder')"
      class="text-lh-text placeholder:text-lh-subtext-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none"
      @keyup.enter="handleEnter"
      @blur="handleUrlBlur"
    />
    <Button
      @click="handleEnter"
      class="text-lh-subtext-0 bg-lh-surface-0 hover:bg-lh-surface-2 min-h-12.5 cursor-pointer rounded-none px-6 py-2 text-base font-bold transition-all @sm:w-24"
    >
      <span class="hidden @sm:block">{{
        $t("home.target_input.send_button.text")
      }}</span>
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
