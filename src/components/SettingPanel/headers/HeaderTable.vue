<template>
  <EditableTable
    addButtonText="新增參數"
    keyTitle="參數"
    valueTitle="數值"
    @add="requestStore.addHeader()"
  >
    <HeaderTableLine
      v-for="item in requestStore.headers"
      :key="item.id"
      :id="item.id"
      :enabled="item.enabled"
      :param="item.key"
      :value="item.value"
    />
  </EditableTable>
</template>

<script setup lang="ts">
import EditableTable from "@/components/SettingPanel/common/EditableTable/EditableTable.vue";
import HeaderTableLine from "./HeaderTableLine.vue";
import { useRequestStore } from "@/stores/useRequestStore";

const requestStore = useRequestStore();
</script>
