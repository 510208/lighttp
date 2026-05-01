<template>
  <Tabs default-value="params">
    <TabsList class="bg-transparent p-0 gap-5">
      <TabsOptions value="params" name="Params" chinese-name="參數" />
      <TabsOptions value="headers" name="Headers" chinese-name="標頭" />
      <TabsOptions value="auth" name="Auth" chinese-name="認證" />
      <TabsOptions value="body" name="Body" chinese-name="主體" />
      <TabsOptions value="proxy" name="Proxy" chinese-name="代理" />
    </TabsList>
    <div id="setting-panel-content" class="min-h-30">
      <TabsContent value="params" as-child><ParamTable /></TabsContent>
      <TabsContent value="headers" as-child><HeaderTable /></TabsContent>
      <TabsContent value="auth" as-child><AuthPanel /></TabsContent>
      <TabsContent value="body" as-child>Body</TabsContent>
      <TabsContent value="proxy" as-child>Proxy</TabsContent>
    </div>
  </Tabs>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "./TabsOption.vue";
import ParamTable from "./params/ParamTable.vue";
import HeaderTable from "./headers/HeaderTable.vue";
import AuthPanel from "./auth/AuthPanel.vue";
</script>
