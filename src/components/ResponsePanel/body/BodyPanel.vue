<template>
  <div class="flex h-full flex-col border-t">
    <CodeViewer
      :model-value="responseStore.body"
      :language="responseLanguage"
      v-if="!bodyIsMedia()"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center overflow-auto bg-zinc-900 p-4"
    >
      <div
        class="bg-ctp-surface-variant flex h-full flex-col items-center justify-center gap-4 rounded p-6"
        v-if="!forceShowMedia"
      >
        <IconContainer><Binary /></IconContainer>

        <p class="text-ctp-overlay2 text-sm">
          回應內容為媒體類型，為保證系統安全已隱藏。<br />

          可點擊下方按鈕強制顯示（請確保回應內容安全無害）。
        </p>

        <Button
          variant="outline"
          @click="
            forceShowMedia = true;

            toast.success('已強制顯示回應內容，請注意安全！');
          "
        >
          強制顯示回應內容
        </Button>
      </div>

      <div v-else class="h-full">
        <!-- 根據不同的 Content-Type 渲染標籤 -->
        <template v-if="getMediaType() === 'image'">
          <img
            :src="mediaUrl"
            class="max-h-full max-w-full object-contain shadow-lg"
          />
        </template>

        <template v-else-if="getMediaType() === 'video'">
          <video :src="mediaUrl" controls class="max-h-full max-w-full"></video>
        </template>

        <template v-else-if="getMediaType() === 'audio'">
          <audio :src="mediaUrl" controls></audio>
        </template>

        <!-- 其他二進位檔案或未知媒體 -->
        <template v-else>
          <iframe :src="mediaUrl" class="h-full w-full rounded"></iframe>
        </template>
      </div>
    </div>

    <!-- 絕對值定位的按鈕，用於提供更多操作 -->
    <div class="absolute right-6 bottom-10">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon-sm">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="copyToClipboard">
            <Copy />
            複製回應結果
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem @click="generateJsonSchema">
            <Braces />
            生成 JSON Schema
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BookA />
              生成型別定義
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent class="mr-2">
                <DropdownMenuItem @click="generatePythonType">
                  Python
                </DropdownMenuItem>
                <DropdownMenuItem @click="generateTypeScriptType">
                  TypeScript
                </DropdownMenuItem>
                <DropdownMenuItem @click="generateRustType">
                  Rust
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Terminal />
              生成 Curl 指令
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent class="mr-2">
                <DropdownMenuItem @click="generateCurlCommand('`')">
                  <Grid2x2 /> 生成適用於 PowerShell 的 Curl 指令
                </DropdownMenuItem>
                <DropdownMenuItem @click="generateCurlCommand('\\')">
                  <Terminal /> 生成適用於 bash 或其他 Shell 的 Curl 指令
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <StructureDialog
        v-model:open="isModalOpen"
        :schema="generatedSchema"
        :language="schemaLanguage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import Button from "@/components/ui/button/Button.vue";
import CodeViewer from "@/components/ui/editor/CodeViewer.vue";

import { useRequestStore } from "@/stores/useRequestStore";
import { useResponseStore } from "@/stores/useResponseStore";

import {
  EllipsisVertical,
  Copy,
  Braces,
  BookA,
  Binary,
  Terminal,
  Grid2x2,
} from "@lucide/vue";
import {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
  getCurlCommand,
} from "@/lib/getStructure";

import { onUnmounted, ref, watch } from "vue";
import StructureDialog from "./StructureDialog.vue";
import { toast } from "vue-sonner";

const forceShowMedia = ref(false);
const mediaUrl = ref<string>("");

const requestStore = useRequestStore();
const responseStore = useResponseStore();
const URL = globalThis.URL;

const isModalOpen = ref(false);
const generatedSchema = ref<string | null>(null);

// 監控 responseStore.header中的 Content-Type，根據不同的類型設置 responseLanguage
const responseLanguage = ref<string>("json");

watch(
  () => responseStore.headers,
  (newHeaders) => {
    if (!newHeaders || typeof newHeaders !== "object") {
      responseLanguage.value = "json";
      return;
    }

    // 由於 HTTP headers 不區分大小寫，需要遍歷查找
    const contentTypeValue = Object.entries(newHeaders).find(
      ([key]) => key.toLowerCase() === "content-type",
    )?.[1];

    if (contentTypeValue) {
      const contentType = contentTypeValue.toLowerCase();
      forceShowMedia.value = false; // 每次 headers 更新時重置強制顯示媒體的狀態

      if (contentType.includes("application/json")) {
        responseLanguage.value = "json";
      } else if (
        contentType.includes("application/xml") ||
        contentType.includes("text/xml")
      ) {
        responseLanguage.value = "xml";
      } else if (contentType.includes("text/html")) {
        responseLanguage.value = "html";
      } else {
        responseLanguage.value = "text";
      }
    } else {
      console.warn("Content-Type header not found. Defaulting to JSON.");
      responseLanguage.value = "json";
    }
  },
  { immediate: true },
);

const schemaLanguage = ref<string>("json");

function getContent() {
  if (responseStore.body === "") {
    return "";
  }
  const bodyObject = JSON.parse(responseStore.body);
  console.log("[Parsed Body Object]:", bodyObject);
  console.log(
    "[Stringified Body Object]:",
    JSON.stringify(bodyObject, null, 2),
  );
  return JSON.stringify(bodyObject, null, 2);
}

// 複製
function copyToClipboard() {
  const textToCopy = getContent();
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      toast.success("成功複製回應結果到剪貼簿！");
    })
    .catch((err) => {
      console.error("Failed to copy response body: ", err);
      toast.error(`複製回應結果到剪貼簿失敗: ${err}`);
    });
}

// 生成 JSON Schema
async function generateJsonSchema() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate JSON Schema.");
    toast.error("回應結果為空，無法生成 JSON Schema。");
    return;
  }
  try {
    const jsonSchema = await convertJsonToSchema(responseStore.body);
    console.log("Generated JSON Schema:", jsonSchema);

    generatedSchema.value = jsonSchema;
    schemaLanguage.value = "json";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate JSON Schema: ",
      error,
    );
  }
}

// 生成型別定義
//   TypeScript
async function generateTypeScriptType() {
  if (responseStore.body === "") {
    console.warn(
      "Response body is empty. Cannot generate TypeScript definitions.",
    );
    toast.error("回應結果為空，無法生成 TypeScript 定義。");
    return;
  }
  try {
    const typeScriptDef = await convertJsonToTypeScript(responseStore.body);
    console.log("Generated TypeScript Definitions:", typeScriptDef);

    generatedSchema.value = typeScriptDef;
    schemaLanguage.value = "typescript";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate TypeScript definitions: ",
      error,
    );
  }
}

//   Python
async function generatePythonType() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate Python definitions.");
    toast.error("回應結果為空，無法生成 Python 定義。");
    return;
  }
  try {
    const pythonDef = await convertJsonToPython(responseStore.body);
    console.log("Generated Python Definitions:", pythonDef);

    generatedSchema.value = pythonDef;
    schemaLanguage.value = "python";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate Python definitions: ",
      error,
    );
  }
}

//   Rust
async function generateRustType() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate Rust definitions.");
    toast.error("回應結果為空，無法生成 Rust 定義。");
    return;
  }
  try {
    const rustDef = await convertJsonToRust(responseStore.body);
    console.log("Generated Rust Definitions:", rustDef);

    generatedSchema.value = rustDef;
    schemaLanguage.value = "rust";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate Rust definitions: ",
      error,
    );
  }
}

//   curl 指令
function generateCurlCommand(symbol: string) {
  const curlCommand = getCurlCommand(requestStore, symbol);
  generatedSchema.value = curlCommand;
  schemaLanguage.value = "shell";
  isModalOpen.value = true;
}

// ------
function getMediaType(): "image" | "video" | "audio" | "other" {
  const contentType =
    Object.entries(responseStore.headers)
      .find(([key]) => key.toLowerCase() === "content-type")?.[1]
      ?.toLowerCase() || "";

  if (contentType.includes("image/")) return "image";
  if (contentType.includes("video/")) return "video";
  if (contentType.includes("audio/")) return "audio";
  return "other";
}

/**
 * 輔助函式：將 Base64 字串轉換為 Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

watch(
  [() => responseStore.body, forceShowMedia],
  ([newBody, show]) => {
    // 釋放舊的 URL 物件，避免記憶體洩漏
    if (mediaUrl.value) {
      URL.revokeObjectURL(mediaUrl.value);
      mediaUrl.value = "";
    }

    // 只有在使用者點擊「強制顯示」且有資料時才執行
    if (show && newBody) {
      const contentType =
        Object.entries(responseStore.headers).find(
          ([key]) => key.toLowerCase() === "content-type",
        )?.[1] || "application/octet-stream";

      try {
        // 將 Base64 還原為二進位數據
        const pureBase64 = newBody.includes(",")
          ? newBody.split(",")[1]
          : newBody;
        const byteArray = base64ToUint8Array(pureBase64);

        // 使用 Array.from 或是明確轉為 BlobPart 陣列
        const blob = new Blob([byteArray] as BlobPart[], { type: contentType });
        console.log("[Generated Media Blob]:", blob);

        // 生成 URL
        mediaUrl.value = URL.createObjectURL(blob);
      } catch (error) {
        console.error("[Base64 Decode Error]:", error);
        toast.error("媒體解碼失敗，請檢查回應格式是否為有效的 Base64。");
      }
    }
  },
  { immediate: true },
);

function bodyIsMedia(): boolean {
  // 判斷 Content-Type 是否為常見的媒體類型（如圖片、影音等）
  const contentTypeValue = Object.entries(responseStore.headers).find(
    ([key]) => key.toLowerCase() === "content-type",
  )?.[1];
  const isMedia =
    contentTypeValue?.includes("image/") ||
    contentTypeValue?.includes("video/") ||
    contentTypeValue?.includes("audio/");

  console.log("[Content-Type]:", contentTypeValue);
  console.log("[Is Media]:", isMedia);
  return isMedia || false;
}

onUnmounted(() => {
  if (mediaUrl.value) {
    URL.revokeObjectURL(mediaUrl.value);
  }
});
</script>

<style scoped></style>
