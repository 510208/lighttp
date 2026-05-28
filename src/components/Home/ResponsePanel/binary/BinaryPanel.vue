<template>
  <div class="flex h-full flex-col border-t">
    <VueHex
      v-model="responseStore.hexViewerBuffer"
      data-mode="window"
      :total-size="fullImageData.length"
      :window-size="0x4000"
      @update-virtual-data="handleUpdateVirtualData"
      statusbar="top"
      :theme="settingsStore.hexViewerConfig.theme"
    />
  </div>
</template>

<script setup lang="ts">
import { useResponseStore } from "@/stores/useResponseStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { VueHexWindowRequest } from "vuehex";

const responseStore = useResponseStore();
const settingsStore = useSettingsStore();

// Save the FULL data BEFORE clearing hexViewerBuffer
const fullImageData = new Uint8Array(responseStore.hexViewerBuffer);

// Now clear hexViewerBuffer to use as the window buffer
if (responseStore.hexViewerBuffer.length > 0x4000) {
  responseStore.hexViewerBuffer = new Uint8Array();
}

async function handleUpdateVirtualData(payload: VueHexWindowRequest) {
  console.log("[VueHex] Data requested:", {
    offset: payload.offset,
    length: payload.length ?? 0x4000,
    timestamp: Date.now(),
  });

  await Promise.resolve();

  const length = payload.length ?? 0x4000;
  const end = Math.min(payload.offset + length, fullImageData.length);

  console.log("[VueHex] Slicing data:", {
    from: payload.offset,
    to: end,
    sliceSize: end - payload.offset,
    fullDataSize: fullImageData.length,
  });

  responseStore.hexViewerBuffer = fullImageData.slice(payload.offset, end);

  console.log(
    "[VueHex] Data updated, buffer size:",
    responseStore.hexViewerBuffer.length,
  );
}
</script>
