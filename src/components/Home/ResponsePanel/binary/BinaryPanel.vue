<template>
  <div class="flex h-full flex-col border-t">
    <VueHex v-model="responseStore.hexViewerBuffer" />
  </div>
</template>

<script setup lang="ts">
import { useResponseStore } from "@/stores/useResponseStore";

const responseStore = useResponseStore();
</script>
