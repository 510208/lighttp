<!-- src/components/HeaderTemplatePicker.vue -->
<template>
  <Dialog v-model:open="open">
    <DialogTrigger>
      <Button variant="outline" class="gap-2 border-dashed">
        <Library />
        {{
          $t(
            "home.settings_panel.tabs.headers.header_template_picker.add_button_text",
          )
        }}
      </Button>
    </DialogTrigger>
    <DialogContent class="min-w-160" align="start">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Library />
          {{
            $t("home.settings_panel.tabs.headers.header_template_picker.title")
          }}
        </DialogTitle>
      </DialogHeader>
      <div class="flex max-h-60 gap-2 overflow-y-auto">
        <!-- 左欄顯示所有的標頭模板 -->
        <div class="max-h-full w-60 overflow-x-hidden overflow-y-auto">
          <div
            class="flex"
            v-for="template in headerTemplates"
            :key="template.key"
          >
            <Button
              variant="ghost"
              class="hover:bg-ctp-surface1 cursor-pointer rounded p-2"
              @click="selectTemplate(template)"
            >
              {{ template.key }}
            </Button>
          </div>
        </div>

        <!-- 右欄顯示選中模板的詳細內容 -->
        <div v-if="selectedHeaderTemplate" class="flex-1 p-2">
          <h4 class="mb-1 text-base font-semibold">
            {{ selectedHeaderTemplate.key }}
          </h4>
          <p class="text-ctp-textSubtle text-sm">
            {{ selectedHeaderTemplate.description }}
          </p>

          <!-- 內容輸入框 -->
          <div class="mt-4">
            <p class="text-ctp-textSubtle mb-1 text-xs">
              {{
                $t(
                  "home.settings_panel.tabs.headers.header_template_picker.value_label",
                )
              }}
            </p>
            <Input
              v-model="selectedHeaderTemplate.value"
              :placeholder="
                $t(
                  'home.settings_panel.tabs.headers.header_template_picker.value_placeholder',
                )
              "
              class="mb-2 w-full"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">
            {{
              $t(
                "home.settings_panel.tabs.headers.header_template_picker.cancel_button_text",
              )
            }}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          @click="selectedHeaderTemplate && addTemplate(selectedHeaderTemplate)"
        >
          <Plus />
          {{
            $t(
              "home.settings_panel.tabs.headers.header_template_picker.confirm_button_text",
            )
          }}
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
} from "@/constants/headerTemplates.ts";
import { useRequestStore } from "@/stores/useRequestStore.ts";
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
