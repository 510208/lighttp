<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, watch, computed } from "vue";
import loader from "@monaco-editor/loader";

type MonacoEditorAlias = any;

const props = defineProps<{
  modelValue?: string; // 接收外部傳入的 JSON 字串
}>();

const editorContainer = ref<HTMLElement | null>(null);

// 使用 shallowRef 儲存實例以優化效能
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);
const monacoRef = shallowRef<any>(null);

const formattedCode = computed(() => {
  if (!props.modelValue) return "";
  try {
    // 第一次 parse：處理傳入的字串，將其轉為物件
    // 這會自動處理掉 \" 並去除最外層的引號
    const parsedData =
      typeof props.modelValue === "string"
        ? JSON.parse(props.modelValue)
        : props.modelValue;

    // 第二次 stringify：轉回格式化後的字串，加上 2 格空格縮排
    return JSON.stringify(parsedData, null, 2);
  } catch (e) {
    console.error("[JSON Parse Error]:", e);
    return props.modelValue; // 若解析失敗則回傳原始值
  }
});

onMounted(async () => {
  if (editorContainer.value) {
    try {
      const monaco = await loader.init();
      monacoRef.value = monaco;

      // 建立編輯器實例
      editorInstance.value = monaco.editor.create(editorContainer.value, {
        value: formattedCode.value,
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
        editorInstance.value.setValue(formattedCode.value);
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
  <div class="flex flex-col overflow-hidden">
    <!-- 編輯器容器 -->
    <div class="h-full min-h-64 w-full">
      <div ref="editorContainer" class="min-h-full w-full"></div>
    </div>
  </div>
</template>

<style scoped>
/* 確保容器高度填滿父級 */
div[ref="editorContainer"] {
  min-height: 100%;
}
</style>
