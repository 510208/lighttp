<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, watch } from "vue";
import loader from "@monaco-editor/loader";
import { prettify } from "htmlfy";

type MonacoEditorAlias = any;

const props = defineProps<{
  modelValue?: string;
  language?: string;
}>();

const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<MonacoEditorAlias | null>(null);
const monacoRef = shallowRef<any>(null);
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
    // 先格式化代码
    formattedCode.value = await formatCode(
      props.modelValue ?? "",
      props.language,
    );

    const monaco = await loader.init();
    monacoRef.value = monaco;

    editorInstance.value = monaco.editor.create(editorContainer.value, {
      value: formattedCode.value,
      language: props.language || "json",
      theme: "vs-dark",
      automaticLayout: true,
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      contextmenu: false,
      fontSize: 14,
    });
  } catch (error) {
    console.error("[Monaco Loader Error]:", error);
  }
});

watch(
  () => [props.modelValue, props.language],
  async () => {
    if (!editorInstance.value) return;

    const nextValue = await formatCode(props.modelValue ?? "", props.language);
    formattedCode.value = nextValue;

    if (nextValue !== editorInstance.value.getValue()) {
      console.log("[New Model Value]:", nextValue);
      editorInstance.value.setValue(nextValue);
    }

    if (monacoRef.value) {
      const model = editorInstance.value.getModel?.();
      if (model) {
        monacoRef.value.editor.setModelLanguage(
          model,
          props.language || "json",
        );
      }
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
