<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, watch } from "vue";
import loader from "@monaco-editor/loader";

type MonacoEditorAlias = any;

const props = defineProps<{
  modelValue?: string; // 接收外部傳入的 JSON 字串
}>();

const editorContainer = ref<HTMLElement | null>(null);

// 使用 shallowRef 儲存實例以優化效能
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);
const monacoRef = shallowRef<any>(null);

onMounted(async () => {
  if (editorContainer.value) {
    try {
      const monaco = await loader.init();
      monacoRef.value = monaco;

      // 建立編輯器實例
      editorInstance.value = monaco.editor.create(editorContainer.value, {
        value: props.modelValue || "",
        language: "json",
        theme: "vs-dark",
        automaticLayout: true,
        readOnly: true, // 設定為唯讀
        domReadOnly: true, // 強化唯讀屬性
        minimap: { enabled: false }, // 關閉縮圖以節省顯示空間
        scrollBeyondLastLine: false,
        contextmenu: false, // 關閉右鍵選單
        fontSize: 14,
      });
    } catch (error) {
      console.error("[Monaco Loader Error]:", error);
    }
  }
});

/**
 * 監聽外部傳入值的變化並同步更新編輯器內容
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance.value) {
      const currentEditorValue = editorInstance.value.getValue();
      if (newVal !== currentEditorValue) {
        editorInstance.value.setValue(newVal || "");
      }
    }
  },
);

// 組件卸載時銷毀實例，防止記憶體洩漏
onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-md border">
    <!-- 編輯器容器 -->
    <div class="h-64">
      <div ref="editorContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<style scoped>
/* 確保容器高度填滿父級 */
div[ref="editorContainer"] {
  min-height: 100%;
}
</style>
