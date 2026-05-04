<template>
  <div class="flex h-full flex-col border-t">
    <CodeViewer
      :model-value="JSON.stringify(responseStore.body, null, 2)"
      :language="responseLanguage"
    />

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
import Button from "@/components/ui/button/Button.vue";
import CodeViewer from "@/components/ui/editor/CodeViewer.vue";
import { useResponseStore } from "@/stores/useResponseStore";
import { EllipsisVertical, Copy, Braces, BookA } from "@lucide/vue";
import {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
} from "@/lib/getStructure";

import { ref, watch } from "vue";
import StructureDialog from "./StructureDialog.vue";
import { toast } from "vue-sonner";

const responseStore = useResponseStore();

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
      console.log("[Content-Type Header]:", contentTypeValue);
      const contentType = contentTypeValue.toLowerCase();
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
</script>

<style scoped></style>
