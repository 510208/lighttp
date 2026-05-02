<script setup>
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
  <div class="editor-container">
    <!-- 将编辑器容器绑定到 ref -->
    <CodeEditor
      v-model:value="code"
      language="json"
      theme="vs-dark"
      :options="editorOptions"
    />
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  background: #ffffff;
}
#editor {
  width: 100%;
  height: 100%;
}
</style>
