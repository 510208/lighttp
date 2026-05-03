<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import loader from "@monaco-editor/loader";
import type { editor } from "monaco-editor";
import { AcceptableValue } from "reka-ui";

const language = ref("json");
const editorContainer = ref<HTMLElement | null>(null);
const code = ref(`{
  "name": "SamHacker",
  "website": "https://samhacker.xyz"
}`);

// 使用 shallowRef 儲存實例以優化效能
const editorInstance = shallowRef<editor.IStandaloneCodeEditor | null>(null);
const monacoRef = shallowRef<any>(null);

onMounted(async () => {
  if (editorContainer.value) {
    try {
      // 透過 loader 初始化 monaco 實例
      const monaco = await loader.init();
      monacoRef.value = monaco;

      // 建立編輯器實例
      editorInstance.value = monaco.editor.create(editorContainer.value, {
        value: code.value,
        language: language.value,
        theme: "vs-dark",
        automaticLayout: true,
      });
    } catch (error) {
      console.error("[Monaco Loader Error]:", error);
    }
  }
});

/**
 * 當語言切換時，動態更新 Model 語言
 * @param newLanguage 選擇的新語言字串
 */
function changeLanguage(newLanguage: AcceptableValue) {
  if (typeof newLanguage !== "string" || !newLanguage) return;

  const editor = editorInstance.value;
  const monaco = monacoRef.value;

  if (editor && monaco) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage);
    }
  }
}

// 組件卸載時銷毀實例，防止記憶體洩漏
onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-2 p-2 px-4">
      <span class="text-sm font-semibold">選擇語言</span>
      <Select v-model="language" @update:model-value="changeLanguage">
        <SelectTrigger class="h-8 w-[180px]">
          <SelectValue placeholder="選擇語言" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="plaintext">Plain Text</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="html">HTML</SelectItem>
          <SelectItem value="xml">XML</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="h-40">
      <div ref="editorContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<style scoped>
/* 容器高度繼承父級確保 Layout 正常 */
div[ref="editorContainer"] {
  min-height: 100%;
}
</style>
