<template>
  <!-- 回應面板 -->
  <div
    class="bg-ctp-surface border-ctp-surface-variant flex h-full min-h-0 flex-col gap-0"
  >
    <div class="flex items-center">
      <h2 class="text-ctp-overlay2 mt-4 px-10 text-sm font-bold">結果</h2>
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

import BodyPanel from "./body/BodyPanel.vue";
import HeaderTable from "./header/HeaderTable.vue";
</script>

<style scoped></style>
