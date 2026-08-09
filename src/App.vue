<template>
  <router-view></router-view>

  <Toaster
    position="bottom-right"
    :closeButton="true"
    closeButtonPosition="top-right"
  />
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { onMounted } from "vue";
import "vue-sonner/style.css";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { checkForUpdates } from "@/services/updater";

const settingsStore = useSettingsStore();

onMounted(() => {
  // #region 自動更新
  if (settingsStore.autoUpdate) {
    checkForUpdates();
  }
  // #endregion
});
</script>

<style scoped></style>
