<template>
  <!-- 回應面板 -->
  <div
    class="bg-ctp-surface border-ctp-surface-variant flex h-full min-h-0 flex-col gap-0"
    v-if="responseIsNormal === true"
  >
    <div class="mt-4 flex items-center gap-2 px-10">
      <h2 class="text-ctp-overlay2 mr-4 text-sm font-bold">
        {{ $t("home.response_panel.title") }}
      </h2>
      <PanelBadge :variant="responseStatus" :icon="Dot">
        {{
          responseStore.status === undefined
            ? $t("home.response_panel.status.loading")
            : responseStore.status === null
              ? $t("home.response_panel.status.no_response")
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
        <TabsOptions
          value="body"
          name="Body"
          :chinese-name="$t('home.response_panel.tabs.body')"
        />
        <TabsOptions
          value="headers"
          name="Headers"
          :chinese-name="$t('home.response_panel.tabs.headers')"
        />
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
  <WaitingResponse v-else-if="responseIsNormal === undefined" />
  <ErrorResponse v-else :responseStoreBody="responseStore.body" />
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "@/components/common/TabsOption.vue";
import PanelBadge from "./common/PanelBadge.vue";
import BodyPanel from "./body/BodyPanel.vue";
import HeaderTable from "./header/HeaderTable.vue";
import WaitingResponse from "./WaitingResponseMessage.vue";
import ErrorResponse from "./ErrorResponse.vue";

import { useResponseStore } from "@/stores/useResponseStore.ts";
import { computed, ref, watch } from "vue";

import { Dot, Timer, File } from "@lucide/vue";

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
    } else if (newStatus === 500) {
      responseIsNormal.value = false;
    } else {
      responseIsNormal.value = true;
    }
  },
  { immediate: true },
);
</script>

<style scoped></style>
