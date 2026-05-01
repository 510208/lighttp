<!-- src/components/HeaderTemplatePicker.vue -->
<template>
  <Dialog v-model:open="open">
    <DialogTrigger>
      <Button variant="outline" class="gap-2 border-dashed border-ctp-surface1">
        <Library /> 從模板新增
      </Button>
    </DialogTrigger>
    <DialogContent
      class="border-ctp-surface1 bg-ctp-mantle min-w-160"
      align="start"
    >
      <DialogHeader>
        <DialogTitle class="flex gap-2 items-center">
          <Library /> 選擇標頭模板
        </DialogTitle>
      </DialogHeader>
      <div class="flex gap-2 max-h-60 overflow-y-auto">
        <!-- 左欄顯示所有的標頭模板 -->
        <div class="w-60 max-h-full overflow-y-auto overflow-x-hidden">
          <div
            class="flex"
            v-for="template in headerTemplates"
            :key="template.key"
          >
            <Button
              variant="ghost"
              class="p-2 rounded cursor-pointer hover:bg-ctp-surface1"
              @click="selectTemplate(template)"
            >
              {{ template.key }}
            </Button>
          </div>
        </div>

        <!-- 右欄顯示選中模板的詳細內容 -->
        <div v-if="selectedHeaderTemplate" class="p-2 flex-1">
          <h4 class="text-base font-semibold mb-1">
            {{ selectedHeaderTemplate.key }}
          </h4>
          <p class="text-sm text-ctp-textSubtle">
            {{ selectedHeaderTemplate.description }}
          </p>

          <!-- 內容輸入框 -->
          <div class="mt-4">
            <p class="text-xs text-ctp-textSubtle mb-1">值：</p>
            <Input
              v-model="selectedHeaderTemplate.value"
              placeholder="請輸入欲使用的標頭內容..."
              class="w-full mb-2"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">關閉</Button>
        </DialogClose>
        <Button
          type="submit"
          @click="selectedHeaderTemplate && addTemplate(selectedHeaderTemplate)"
        >
          <Plus /> 新增標頭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Library, Plus } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  headerTemplates,
  type HeaderTemplate,
} from "@/constants/headerTemplates";
import { useRequestStore } from "@/stores/useRequestStore";
import { Input } from "@/components/ui/input";

const open = ref(false);
const requestStore = useRequestStore();

// 選中的模板
const selectedHeaderTemplate = ref<HeaderTemplate | null>(null);
function selectTemplate(template: HeaderTemplate) {
  selectedHeaderTemplate.value = template;
}

// 選擇模板後的處理函數
const addTemplate = (template: HeaderTemplate) => {
  const newHeader = {
    key: template.key,
    value: template.value,
    enabled: true,
  };
  try {
    requestStore.addHeaderFromPair(newHeader.key, newHeader.value);
  } catch (error) {
    console.error("新增標頭失敗:", error);
    return;
  }
  // 清空選取狀態
  selectedHeaderTemplate.value = null;
  open.value = false; // 選擇後關閉選單
};
</script>
