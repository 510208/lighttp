<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, onMounted, onUnmounted, shallowRef, watch } from "vue";
import loader from "@monaco-editor/loader";
// Monaco types may not be available in some environments. Use a lightweight local alias
// to avoid TypeScript errors when the module or its type declarations aren't found.
type MonacoEditorAlias = any;
import { AcceptableValue } from "reka-ui";
import { Button } from "@/components/ui/button";
import { Upload } from "@lucide/vue";

const props = defineProps<{
  modelValue?: string; // 接收外部傳入的程式碼
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const language = ref("json");
const editorContainer = ref<HTMLElement | null>(null);
const code = ref(
  props.modelValue ||
    `{
  "name": "SamHacker",
  "age": null,
  "isAdmin": true,
}`,
);

// 使用 shallowRef 儲存實例以優化效能
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);
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
      emit("update:modelValue", code.value);

      editorInstance.value.getModel().onDidChangeContent(() => {
        const newValue = editorInstance.value?.getValue() || "";
        console.log("Editor content changed:", newValue);

        // 只有在值真的改變時才發送更新，避免冗餘觸發
        if (newValue !== props.modelValue) {
          emit("update:modelValue", newValue);
        }
      });
    } catch (error) {
      console.error("[Monaco Loader Error]:", error);
    }
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (!editorInstance.value) return;

    const currentEditorValue = editorInstance.value.getValue();

    // 只有當外部傳入的值與編輯器內部的內容「不一致」時，才執行 setValue
    // 這通常發生在切換頁面回來、點擊重置按鈕或從 API 載入資料時
    if (newVal !== currentEditorValue) {
      editorInstance.value.setValue(newVal);
    }
  },
);

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

// 處理讀取檔案的邏輯
function handleFileUpload() {
  // 建立一個隱藏的 input 元素
  const input = document.createElement("input");
  input.type = "file";
  // 限制讀取文字類型的檔案 (可依需求調整，例如 .json, .txt, .js)
  input.accept = ".json,.txt,.js,.html,.xml,.ts,text/plain";

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();

      // 當檔案讀取完成時觸發
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          // 1. 更新編輯器實例的值 (這會觸發 onDidChangeContent 並 emit update:modelValue)
          if (editorInstance.value) {
            editorInstance.value.setValue(content);
          }

          // 2. 嘗試自動根據副檔名判定語言 (選配功能)
          autoDetectLanguage(file.name);

          console.log(`[File System] Loaded: ${file.name}`);
        }
      };

      reader.onerror = () => {
        console.error("[File System] Failed to read file.");
      };

      // 以 UTF-8 編碼讀取檔案內容
      reader.readAsText(file);
    }
  };

  // 觸發點擊，開啟系統檔案選取視窗
  input.click();
}

/**
 * 輔助函式：根據副檔名自動切換編輯器語言標註
 */
function autoDetectLanguage(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mapping: Record<string, string> = {
    json: "json",
    js: "javascript",
    ts: "typescript",
    html: "html",
    xml: "xml",
    txt: "plaintext",
  };

  if (extension && mapping[extension]) {
    language.value = mapping[extension];
    changeLanguage(mapping[extension]);
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between">
      <div class="flex items-center gap-2 p-2 px-4">
        <span class="text-sm font-semibold">選擇語言</span>
        <Select v-model="language" @update:model-value="changeLanguage">
          <SelectTrigger class="h-8 w-[180px]">
            <SelectValue placeholder="選擇語言" size="sm" />
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

      <!-- 從檔案讀取按鈕 -->
      <div class="flex items-center gap-2 p-2 px-4">
        <Button variant="ghost" @click="handleFileUpload">
          <Upload class="h-4 w-4" />
          讀取檔案
        </Button>
      </div>
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
