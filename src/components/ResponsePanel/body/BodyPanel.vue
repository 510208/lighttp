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
        </DropdownMenuContent>
      </DropdownMenu>
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
import { EllipsisVertical, Copy } from "@lucide/vue";

const responseStore = useResponseStore();

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
      console.log("Response body copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy response body: ", err);
    });
}
</script>

<style scoped></style>
