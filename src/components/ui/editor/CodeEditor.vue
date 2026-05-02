<script setup lang="ts">
import { ref } from "vue";
import { CodeEditor } from "monaco-editor-vue3";

const code = ref(`{
  "name": "SamHacker",
  "age": 18,
  "city": "Taichung"
}`);

const editorOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
};
</script>

<template>
  <div class="h-40">
    <CodeEditor
      v-model:value="code"
      language="json"
      theme="vs-dark"
      :options="editorOptions"
    />
  </div>
</template>

<style scoped></style>
