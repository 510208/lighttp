<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, onMounted, onUnmounted, shallowRef, watch } from "vue";

// 1. 直接引進本地的 monaco 核心（移除 loader）
import * as monaco from "monaco-editor";

// 2. 利用 Vite 的 ?worker&inline 語法，把所有 Worker 變成本地內聯字串，解決正式版黑屏與 CSP 限制
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker&inline";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker&inline";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker&inline";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker&inline";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker&inline";

// 3. 配置全域環境變數，讓 monaco 核心正確找到這些內聯的 Worker 實體
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") return new jsonWorker();
    if (label === "css" || label === "scss" || label === "less")
      return new cssWorker();
    if (label === "html" || label === "handlebars" || label === "razor")
      return new htmlWorker();
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

// Monaco types may not be available in some environments. Use a lightweight local alias
type MonacoEditorAlias = any;
import { AcceptableValue } from "reka-ui";
import { Button } from "@/components/ui/button";
import { Upload } from "@lucide/vue";

// 4. 引入你之前用到的 Catppuccin 主題 JSON 檔案
import ctpMocha from "@/assets/themes/editor/mocha.json";

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
    `{\n  "name": "SamHacker",\n  "age": null,\n  "isAdmin": true\n}`,
);

// 使用 shallowRef 儲存實例以優化效能
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);

onMounted(() => {
  if (editorContainer.value) {
    try {
      // 5. 註冊 Catppuccin 主題（加上型態斷言防止 TS2345 錯誤）
      monaco.editor.defineTheme(
        "catppuccinomocha",
        ctpMocha as monaco.editor.IStandaloneThemeData,
      );

      // 6. 直接使用本地的 monaco.editor.create 建立編輯器實例
      editorInstance.value = monaco.editor.create(editorContainer.value, {
        value: code.value,
        language: language.value,
        theme: "catppuccinomocha",
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
      console.error("[Monaco Init Error]:", error);
    }
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (!editorInstance.value) return;

    const currentEditorValue = editorInstance.value.getValue();

    // 只有當外部傳入的值與編輯器內部的內容「不一致」時，才執行 setValue
    if (newVal !== currentEditorValue) {
      editorInstance.value.setValue(newVal ?? "");
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

  // 7. 直接呼叫本地 monaco 實例進行語言變更
  if (editor) {
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
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.txt,.js,.html,.xml,.ts,text/plain";

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          if (editorInstance.value) {
            editorInstance.value.setValue(content);
          }
          autoDetectLanguage(file.name);
          console.log(`[File System] Loaded: ${file.name}`);
        }
      };

      reader.onerror = () => {
        console.error("[File System] Failed to read file.");
      };

      reader.readAsText(file);
    }
  };

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
        <span class="text-sm font-semibold">
          {{
            $t("home.settings_panel.tabs.body.body_original.choose_language")
          }}
        </span>
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
          {{ $t("home.settings_panel.tabs.body.body_original.load_from_file") }}
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
