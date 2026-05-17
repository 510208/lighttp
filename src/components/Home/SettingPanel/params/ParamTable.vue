<template>
  <EditableTable
    :addButtonText="$t('settings_panel.tabs.params.add_button_text')"
    :keyTitle="$t('settings_panel.tabs.params.key_title')"
    :valueTitle="$t('settings_panel.tabs.params.value_title')"
    @add="requestStore.addParam()"
  >
    <ParamTableLine
      v-for="item in requestStore.params"
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
import ParamTableLine from "./ParamTableLine.vue";
import { useRequestStore } from "@/stores/useRequestStore.ts";

const requestStore = useRequestStore();
</script>
