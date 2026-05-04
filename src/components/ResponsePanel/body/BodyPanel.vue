<template>
  <div class="flex h-full flex-col border-t">
    <CodeViewer :model-value="JSON.stringify(responseStore.body, null, 2)" />
  </div>
</template>

<script setup lang="ts">
import CodeViewer from "@/components/ui/editor/CodeViewer.vue";
import { useResponseStore } from "@/stores/useResponseStore";

const responseStore = useResponseStore();
</script>

<style scoped></style>
