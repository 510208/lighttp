<template>
  <EditableTable
    addButtonText="新增標頭"
    keyTitle="請求標頭"
    valueTitle="內容"
    @add="requestStore.addHeader()"
  >
    <!-- 依模板新增按鈕 -->
    <template #extra>
      <HeaderTemplatePicker />
    </template>

    <!-- 內容 -->
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
import HeaderTemplatePicker from "./HeaderTemplatePicker.vue";

const requestStore = useRequestStore();
</script>
