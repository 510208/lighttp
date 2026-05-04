<template>
  <!-- 回應面板 -->
  <div
    class="bg-ctp-surface border-ctp-surface-variant flex h-full min-h-0 flex-col gap-0"
  >
    <div class="mt-4 flex items-center">
      <h2 class="text-ctp-overlay2 px-10 text-sm font-bold">結果</h2>
      <PanelBadge :variant="responseStatus" :icon="Dot">
        {{
          responseStore.status === undefined
            ? "載入中"
            : responseStore.status === null
              ? "無回應"
              : responseStore.status
        }}
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
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "@/components/common/TabsOption.vue";
import PanelBadge from "./common/PanelBadge.vue";

import BodyPanel from "./body/BodyPanel.vue";
import HeaderTable from "./header/HeaderTable.vue";

import { useResponseStore } from "@/stores/useResponseStore";
import { computed } from "vue";

import { Dot } from "@lucide/vue";

const responseStore = useResponseStore();
const responseStatus = computed(() => {
  if (responseStore.status === undefined) return "loading";
  if (responseStore.status === null) return "none";
  if (responseStore.status >= 400) return "error";
  return "success";
});
</script>

<style scoped></style>
