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

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 定義 Props
interface Props {
  open: boolean;
  schema: string | null;
  language?: string;
}
const props = defineProps<Props>();

console.log("StructureDialog Props:", {
  open: props.open,
  schema: props.schema,
  language: props.language,
});

// 定義 Emits 用於同步 open 狀態
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

// 複製到剪貼簿的簡單邏輯
const copyToClipboard = () => {
  if (props.schema) {
    navigator.clipboard.writeText(props.schema);
    toast.success(t("home.response_panel.structure_dialog.toast.copy_success"));
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle
          >{{ t("home.response_panel.structure_dialog.title_prefix") }}
          {{ props.language || "JSON" }}
          {{
            t("home.response_panel.structure_dialog.title_suffix")
          }}</DialogTitle
        >
        <DialogDescription>
          {{ t("home.response_panel.structure_dialog.description") }}
        </DialogDescription>
      </DialogHeader>

      <!-- 顯示 Schema 內容 -->
      <div class="my-4 grid h-60 gap-4 overflow-hidden rounded-md border">
        <CodeViewer
          v-if="schema"
          :model-value="schema"
          :language="props.language || 'json'"
        />
        <p v-else class="text-muted-foreground text-center text-sm">
          {{ t("home.response_panel.structure_dialog.no_schema") }}
        </p>
      </div>

      <DialogFooter class="flex items-center !justify-between">
        <div>
          <p class="text-muted-foreground text-left text-xs">
            {{ t("home.response_panel.structure_dialog.credit_text") }}
            <a
              href="https://quicktype.io/"
              target="_blank"
              class="text-primary underline"
            >
              {{ t("home.response_panel.structure_dialog.credit_lib_name") }}
            </a>
            {{ t("home.response_panel.structure_dialog.credit_suffix") }}
          </p>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" @click="emit('update:open', false)">
            {{ t("home.response_panel.structure_dialog.close_button") }}
          </Button>
          <Button @click="copyToClipboard">
            <Copy :size="16" />
            {{ t("home.response_panel.structure_dialog.copy_button") }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
