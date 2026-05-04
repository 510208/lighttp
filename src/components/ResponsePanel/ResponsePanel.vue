<template>
  <!-- 回應面板 -->
  <div
    class="bg-ctp-surface border-ctp-surface-variant flex h-full min-h-0 flex-col gap-0"
    v-if="responseIsNormal === true"
  >
    <div class="mt-4 flex items-center gap-2 px-10">
      <h2 class="text-ctp-overlay2 mr-4 text-sm font-bold">結果</h2>
      <PanelBadge :variant="responseStatus" :icon="Dot">
        {{
          responseStore.status === undefined
            ? "載入中"
            : responseStore.status === null
              ? "無回應"
              : responseStore.status
        }}
      </PanelBadge>

      <PanelBadge
        v-if="responseStore.size !== undefined"
        variant="ready"
        :icon="File"
      >
        {{ (responseStore.size / 1024).toFixed(2) }} KB
      </PanelBadge>

      <PanelBadge
        v-if="responseStore.timeTaken !== undefined"
        variant="ready"
        :icon="Timer"
      >
        {{ responseStore.timeTaken?.toFixed(3) }} ms
      </PanelBadge>
    </div>
    <Tabs default-value="body" class="flex min-h-0 flex-1 flex-col">
      <TabsList class="mt-2 gap-5 bg-transparent p-4 px-10">
        <TabsOptions value="body" name="Body" chinese-name="主體" />
        <TabsOptions value="headers" name="Headers" chinese-name="標頭" />
      </TabsList>
      <div
        id="setting-panel-content"
        class="mb-6 h-full min-h-0 overflow-hidden"
      >
        <TabsContent value="body" as-child><BodyPanel /></TabsContent>
        <TabsContent value="headers" as-child><HeaderTable /></TabsContent>
      </div>
    </Tabs>
  </div>
  <div
    v-else-if="responseIsNormal === undefined"
    class="flex h-full flex-col border-t"
  >
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-900"
    >
      <IconContainer><LoaderCircle class="animate-spin" /></IconContainer>
      <div class="flex flex-col items-center justify-center gap-0">
        <h2 class="text-lg font-semibold text-white">等待回應中</h2>
        <p class="text-ctp-overlay2 text-sm">趁這個時間休息一下如何？</p>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex h-full flex-col items-center justify-center gap-4 border-t"
  >
    <IconContainer variant="error"
      ><CircleX class="text-ctp-red-100"
    /></IconContainer>
    <div class="flex flex-col items-center justify-center gap-0">
      <h2 class="text-ctp-red-100 text-lg font-semibold">回應錯誤</h2>
      <p class="text-ctp-red-300 text-sm">完了，出現錯誤了。</p>
      <pre
        class="mt-2 overflow-scroll rounded bg-red-50 px-2 py-1 text-left text-xs text-red-500"
        >{{ parseErrorMessage(responseStore.body) || "無錯誤訊息" }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "@/components/common/TabsOption.vue";
import PanelBadge from "./common/PanelBadge.vue";
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import BodyPanel from "./body/BodyPanel.vue";
import HeaderTable from "./header/HeaderTable.vue";

import { useResponseStore } from "@/stores/useResponseStore";
import { computed, ref, watch } from "vue";

import { Dot, Timer, File, CircleX } from "@lucide/vue";

import { LoaderCircle } from "@lucide/vue";

const responseStore = useResponseStore();
const responseStatus = computed(() => {
  if (responseStore.status === undefined) return "loading";
  if (responseStore.status === null) return "none";
  if (responseStore.status >= 400) return "error";
  return "success";
});

// ------
// 檢查回應是否有問題
const responseIsNormal = ref(true as boolean | undefined);
watch(
  () => responseStore.status,
  (newStatus) => {
    if (newStatus === null) {
      responseIsNormal.value = true;
    } else if (newStatus === undefined) {
      // undefined 代表仍在等待回應
      responseIsNormal.value = undefined;
      console.log("Response status is undefined, waiting for response...");
    } else if (typeof newStatus === "number") {
      responseIsNormal.value = newStatus >= 200 && newStatus < 300;
    } else {
      responseIsNormal.value = false;
    }
  },
  { immediate: true },
);

function parseErrorMessage(body: string): string {
  try {
    // 將 -> 替換成 ->\n，讓它能正確換行
    const formattedBody = body.replace(/->/g, "\n->");
    return formattedBody;
  } catch {
    return body;
  }
}
</script>

<style scoped></style>
