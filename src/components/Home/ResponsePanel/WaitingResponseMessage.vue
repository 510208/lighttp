<template>
  <div class="flex h-full flex-col border-t">
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-900"
    >
      <IconContainer><LoaderCircle class="animate-spin" /></IconContainer>
      <div class="flex flex-col items-center justify-center gap-0">
        <h2 class="text-lg font-semibold text-white">
          {{ $t("home.response_panel.waiting_response.title") }}
        </h2>
        <p class="text-ctp-overlay2 text-sm">
          {{ $t("home.response_panel.waiting_response.description") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { LoaderCircle } from "@lucide/vue";
</script>

<style scoped></style>
