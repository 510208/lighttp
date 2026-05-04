<template>
  <!-- 回應面板 -->
  <div class="bg-ctp-surface border-ctp-surface-variant h-full min-h-0 p-4">
    <Tabs default-value="params">
      <TabsList class="gap-5 bg-transparent p-0">
        <TabsOptions value="params" name="Params" chinese-name="參數" />
        <TabsOptions value="headers" name="Headers" chinese-name="標頭" />
      </TabsList>
      <div id="setting-panel-content" class="min-h-30">
        <TabsContent value="params" as-child>ParamTable /></TabsContent>
        <TabsContent value="headers" as-child>HeaderTable /></TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "@/components/common/TabsOption.vue";
</script>

<style scoped></style>
