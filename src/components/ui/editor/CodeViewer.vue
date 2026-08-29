<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, watch } from "vue";
import { prettify } from "htmlfy";

import * as monaco from "./monaco";

// Credit: https://github.com/josephabbey/catppuccin-monaco
import ctpMocha from "@/assets/themes/editor/mocha.json";

type MonacoEditorAlias = any;

const props = defineProps<{
  modelValue?: string;
  language?: string;
}>();

const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);
const formattedCode = ref<string>("");

async function formatCode(code: string, language?: string): Promise<string> {
  if (!code || code === "") return "";

  try {
    console.log("Language:", language);

    switch (language) {
      case "json":
      case "jsonc":
        return formatJson(code);
      case "html":
      case "htm":
      case "xml":
        return await formatHtml(code);
      default:
        return code;
    }
  } catch (e) {
    console.error("[Format Error]:", e);
    return code;
  }
}

function formatJson(code: string): string {
  try {
    const parsed = JSON.parse(JSON.parse(code));
    console.log("[Parsed JSON]:", parsed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      console.error("[JSON Parse Error]:", e);
      return code;
    }
  }
}

async function formatHtml(code: string): Promise<string> {
  try {
    const formatted = prettify(code, {
      tab_size: 2,
    });

    return formatted;
  } catch (e) {
    console.error("[HTML Format Error]:", e);
    return code;
  }
}

onMounted(async () => {
  if (!editorContainer.value) return;

  try {
    formattedCode.value = await formatCode(
      props.modelValue ?? "",
      props.language,
    );

    // 4. 不需要再 await loader.init() 了，直接使用本地的 monaco 變數
    monaco.editor.defineTheme(
      "catppuccinomocha",
      ctpMocha as monaco.editor.IStandaloneThemeData,
    );

    editorInstance.value = monaco.editor.create(editorContainer.value, {
      value: formattedCode.value,
      language: props.language || "json",
      theme: "catppuccinomocha",
      automaticLayout: true,
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      contextmenu: false,
      fontSize: 14,
    });
  } catch (error) {
    console.error("[Monaco Init Error]:", error);
  }
});

watch(
  () => [props.modelValue, props.language],
  async () => {
    if (!editorInstance.value) return;

    const nextValue = await formatCode(props.modelValue ?? "", props.language);
    formattedCode.value = nextValue;

    if (nextValue !== editorInstance.value.getValue()) {
      editorInstance.value.setValue(nextValue);
    }

    // 5. 這裡也改為直接使用本地導入的 monaco
    const model = editorInstance.value.getModel?.();
    if (model) {
      monaco.editor.setModelLanguage(model, props.language || "json");
    }
  },
);

onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div ref="editorContainer" class="w-full flex-1"></div>
  </div>
</template>

<style scoped>
div[ref="editorContainer"] {
  min-height: 100%;
}
</style>
