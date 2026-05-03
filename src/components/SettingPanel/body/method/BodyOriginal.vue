<template>
  <CodeEditor v-model="bodyContent" />
</template>

<script setup lang="ts">
import CodeEditor from "@/components/ui/editor/CodeEditor.vue";
import { useRequestStore } from "@/stores/useRequestStore";
import { computed } from "vue";

const requestStore = useRequestStore();

// 將編輯器的內容與 Store 的變數雙向綁定
const bodyContent = computed({
  get: () => requestStore.bodyContent || "",
  set: (val) => requestStore.setBodyContent(val),
});
</script>
