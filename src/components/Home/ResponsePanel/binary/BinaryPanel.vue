<template>
  <div class="flex h-full flex-col border-t">
    <VueHex
      v-model="windowBuffer"
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
import { computed, shallowRef, watch } from "vue";

const responseStore = useResponseStore();
const settingsStore = useSettingsStore();

// The virtual window is view state, not the tab's full response bytes.
const fullImageData = computed(() => responseStore.hexViewerBuffer);
const windowBuffer = shallowRef(new Uint8Array(0));
watch(
  fullImageData,
  (data) => {
    windowBuffer.value = data.slice(0, 0x4000);
  },
  { immediate: true },
);

async function handleUpdateVirtualData(payload: VueHexWindowRequest) {
  console.log("[VueHex] Data requested:", {
    offset: payload.offset,
    length: payload.length ?? 0x4000,
    timestamp: Date.now(),
  });

  await Promise.resolve();

  const length = payload.length ?? 0x4000;
  const end = Math.min(payload.offset + length, fullImageData.value.length);

  console.log("[VueHex] Slicing data:", {
    from: payload.offset,
    to: end,
    sliceSize: end - payload.offset,
    fullDataSize: fullImageData.value.length,
  });

  windowBuffer.value = fullImageData.value.slice(payload.offset, end);

  console.log("[VueHex] Data updated, buffer size:", windowBuffer.value.length);
}
</script>
