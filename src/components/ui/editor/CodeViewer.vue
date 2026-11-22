<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { prettify } from "htmlfy";
import * as monaco from "./monaco";
import ctpMocha from "@/assets/themes/editor/mocha.json";

const props = defineProps<{
  modelValue?: string;
  language?: string;
  cacheKey?: string;
  cacheKeys?: string[];
}>();

const editorContainer = ref<HTMLElement | null>(null);
const updating = ref(true);
// Monaco instances and models must stay outside Vue's deep reactivity.
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let updateTimer: ReturnType<typeof setTimeout> | undefined;
let disposed = false;
const FORMAT_LIMIT = 256 * 1024;
const HIGHLIGHT_LIMIT = 1024 * 1024;
const CACHE_LIMIT = 64 * 1024 * 1024;
const MAX_CACHED_MODELS = 4;
interface CachedModel {
  source: string;
  language: string;
  model: monaco.editor.ITextModel;
  viewState: monaco.editor.ICodeEditorViewState | null;
  bytes: number;
}
const models = new Map<string, CachedModel>();
let currentKey: string | null = null;

function formatCode(code: string, language: string): string {
  // Large payloads retain their complete raw text without main-thread parsing.
  if (!code || code.length > FORMAT_LIMIT) return code;
  try {
    if (language === "json" || language === "jsonc") {
      let parsed: unknown = JSON.parse(code);
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          /* Keep JSON strings intact. */
        }
      }
      return JSON.stringify(parsed, null, 2);
    }
    if (["html", "htm", "xml"].includes(language))
      return prettify(code, { tab_size: 2 });
  } catch {
    // Invalid or incomplete responses should still be readable.
  }
  return code;
}

function removeModel(key: string) {
  const cached = models.get(key);
  if (!cached) return;
  if (key === currentKey) {
    editor?.setModel(null);
    currentKey = null;
  }
  cached.model.dispose();
  models.delete(key);
}

function trimCache() {
  let bytes = [...models.values()].reduce(
    (total, cached) => total + cached.bytes,
    0,
  );
  for (const [key, cached] of models) {
    if (bytes <= CACHE_LIMIT && models.size <= MAX_CACHED_MODELS) break;
    if (key === currentKey) continue;
    bytes -= cached.bytes;
    removeModel(key);
  }
}

function updateModel() {
  if (disposed || !editor) return;
  const source = props.modelValue ?? "";
  const language = props.language || "json";
  const key = props.cacheKey ?? "default";
  const previous = currentKey ? models.get(currentKey) : undefined;
  if (previous) previous.viewState = editor.saveViewState();
  let cached = models.get(key);
  if (cached && (cached.source !== source || cached.language !== language)) {
    removeModel(key);
    cached = undefined;
  }
  if (!cached) {
    const formatted = formatCode(source, language);
    cached = {
      source,
      language,
      model: monaco.editor.createModel(
        formatted,
        source.length > HIGHLIGHT_LIMIT ? "plaintext" : language,
      ),
      viewState: null,
      bytes: (source.length + (formatted === source ? 0 : formatted.length)) * 2,
    };
  }
  // Reinsertion keeps the least recently used model first for bounded eviction.
  models.delete(key);
  models.set(key, cached);
  currentKey = key;
  editor.setModel(cached.model);
  if (cached.viewState) editor.restoreViewState(cached.viewState);
  trimCache();
  updating.value = false;
}

function scheduleUpdate() {
  clearTimeout(updateTimer);
  updating.value = true;
  // Let tab selection paint and coalesce rapid wheel/keyboard switches.
  updateTimer = setTimeout(updateModel, 60);
}

onMounted(() => {
  if (!editorContainer.value) return;
  monaco.editor.defineTheme(
    "catppuccinomocha",
    ctpMocha as monaco.editor.IStandaloneThemeData,
  );
  editor = monaco.editor.create(editorContainer.value, {
    model: null,
    theme: "catppuccinomocha",
    automaticLayout: true,
    readOnly: true,
    domReadOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    contextmenu: false,
    fontSize: 14,
    largeFileOptimizations: true,
    folding: false,
    occurrencesHighlight: "off",
    selectionHighlight: false,
    renderValidationDecorations: "off",
  });
  scheduleUpdate();
});

watch(() => [props.cacheKey, props.modelValue, props.language], scheduleUpdate);
watch(
  () => props.cacheKeys,
  (keys) => {
    if (!keys) return;
    const remaining = new Set(keys);
    for (const key of models.keys()) if (!remaining.has(key)) removeModel(key);
  },
);

onUnmounted(() => {
  disposed = true;
  clearTimeout(updateTimer);
  editor?.dispose();
  editor = null;
  for (const cached of models.values()) cached.model.dispose();
  models.clear();
});
</script>

<template>
  <div
    class="relative flex h-full flex-col overflow-hidden"
    :aria-busy="updating"
  >
    <div
      ref="editorContainer"
      class="w-full flex-1"
      :class="{ invisible: updating }"
    ></div>
    <div
      v-if="updating"
      role="status"
      class="text-lh-subtext-0 absolute inset-0 flex items-center justify-center text-sm"
    >
      {{ $t("home.response_panel.status.loading") }}
    </div>
  </div>
</template>

<style scoped>
div[ref="editorContainer"] {
  min-height: 100%;
}
</style>
