<template>
  <div
    class="text-ctp-text flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-sm"
  >
    <IconContainer>
      <Ghost />
    </IconContainer>
    <h3 class="text-ctp-text text-lg font-bold">無需主體</h3>
    <p>此請求方式無需發送 Body 資料</p>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { Ghost } from "lucide-vue-next";
</script>
