<script setup lang="ts">
import BodyFilePicker from "../BodyFilePicker.vue";
import { useRequestStore } from "@/stores/useRequestStore";
import { selectBodyFile } from "@/services/requestBodyFile";

const requestStore = useRequestStore();
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <BodyFilePicker
      :file-path="requestStore.bodyFilePath"
      @select="selectBodyFile()"
      @remove="requestStore.bodyFilePath = null"
    />
    <p class="text-lh-subtext-1 text-sm">
      {{ $t("home.settings_panel.tabs.body.file_path_hint") }}
    </p>
  </div>
</template>
