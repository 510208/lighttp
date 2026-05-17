<template>
  <div
    class="text-ctp-text flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-sm"
  >
    <IconContainer>
      <Ghost />
    </IconContainer>
    <h3 class="text-ctp-text text-lg font-bold">
      {{ $t("settings_panel.tabs.body.no_body.title") }}
    </h3>
    <p>{{ $t("settings_panel.tabs.body.no_body.description") }}</p>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { Ghost } from "lucide-vue-next";
</script>
