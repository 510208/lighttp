<template>
  <div class="flex h-full flex-col border-t">
    <CodeViewer :model-value="JSON.stringify(responseStore.body, null, 2)" />

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
          <DropdownMenuItem @click="generateJsonSchema">
            <Braces />
            生成 JSON Schema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <StructureDialog v-model:open="isModalOpen" :schema="generatedSchema" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Button from "@/components/ui/button/Button.vue";
import CodeViewer from "@/components/ui/editor/CodeViewer.vue";
import { useResponseStore } from "@/stores/useResponseStore";
import { EllipsisVertical, Copy, Braces } from "@lucide/vue";
import { convertJsonToSchema } from "@/lib/getStructure";

import { ref } from "vue";
import StructureDialog from "./StructureDialog.vue";
import { toast } from "vue-sonner";

const responseStore = useResponseStore();

const isModalOpen = ref(false);
const generatedSchema = ref<string | null>(null);

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
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate JSON Schema: ",
      error,
    );
  }
}
</script>

<style scoped></style>
