<template>
  <div class="flex flex-col gap-7.5 px-10 py-7.5">
    <!-- 請求輸入框 -->
    <TargetInput />
    <!-- 設定面板 -->
    <SettingPanel />
  </div>
</template>

<script setup lang="ts">
import TargetInput from "@/components/Home/TargetInput/TargetInput.vue";
import SettingPanel from "@/components/Home/SettingPanel/SettingPanel.vue";
</script>
