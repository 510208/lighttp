<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import { Copy } from "@lucide/vue";

import CodeViewer from "@/components/ui/editor/CodeViewer.vue";

// 定義 Props
interface Props {
  open: boolean;
  schema: string | null;
}

const props = defineProps<Props>();

// 定義 Emits 用於同步 open 狀態
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

// 複製到剪貼簿的簡單邏輯
const copyToClipboard = () => {
  if (props.schema) {
    navigator.clipboard.writeText(props.schema);
    toast.success("已複製到剪貼簿！");
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>產生的 JSON Schema</DialogTitle>
        <DialogDescription>
          以下是根據您的設定所產生的結構化資料。
        </DialogDescription>
      </DialogHeader>

      <!-- 顯示 Schema 內容 -->
      <div class="my-4 grid h-60 gap-4 overflow-hidden rounded-md border">
        <CodeViewer v-if="schema" :model-value="schema" language="json" />
        <p v-else class="text-muted-foreground text-center text-sm">
          沒有可顯示的 Schema。
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">
          關閉
        </Button>
        <Button @click="copyToClipboard">
          <Copy :size="16" />
          複製 JSON
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
