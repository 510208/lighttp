<template>
  <EditableTable
    :addButtonText="$t('home.settings_panel.tabs.headers.add_button_text')"
    :keyTitle="$t('home.settings_panel.tabs.headers.key_title')"
    :valueTitle="$t('home.settings_panel.tabs.headers.value_title')"
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
import EditableTable from "@/components/Home/SettingPanel/common/EditableTable/EditableTable.vue";
import HeaderTableLine from "./HeaderTableLine.vue";
import { useRequestStore } from "@/stores/useRequestStore.ts";
import HeaderTemplatePicker from "./HeaderTemplatePicker.vue";

const requestStore = useRequestStore();
</script>
