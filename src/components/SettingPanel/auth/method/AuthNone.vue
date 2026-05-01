<template>
  <div
    class="text-ctp-text flex h-full w-full flex-col items-center justify-center gap-2 text-sm"
  >
      <IconContainer>
        <Ghost />
      </IconContainer>
    <p>此選項無需進一步的認證設定</p>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { Ghost } from "@lucide/vue";
</script>
