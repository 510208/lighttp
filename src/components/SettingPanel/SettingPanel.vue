<template>
  <Tabs default-value="params">
    <TabsList class="bg-transparent p-0 gap-5">
      <TabsOptions value="params" name="Params" chinese-name="參數" />
      <TabsOptions value="headers" name="Headers" chinese-name="標頭" />
      <TabsOptions value="body" name="Body" chinese-name="主體" />
      <TabsOptions value="proxy" name="Proxy" chinese-name="代理" />
    </TabsList>
    <TabsContent value="params"><ParamTable /></TabsContent>
    <TabsContent value="headers"><HeaderTable /></TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "./TabsOption.vue";
import ParamTable from "./params/ParamTable.vue";
import HeaderTable from "./headers/HeaderTable.vue";
</script>
