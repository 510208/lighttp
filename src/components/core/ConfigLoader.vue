<template>
  <!-- 此組件不渲染任何內容，只負責在掛載時啟動 Tauri 並載入設定 -->
  <div class="hidden"></div>
</template>

<script lang="ts" setup>
import { useSettingsStore } from "@/stores/useSettingsStore";
import { onMounted } from "vue";
const settingsStore = useSettingsStore();

// 確保在組件掛載時就啟動 Tauri 並載入設定
onMounted(async () => {
  await settingsStore.$tauri.start();
  settingsStore.setLanguage(settingsStore.language);
});
</script>
