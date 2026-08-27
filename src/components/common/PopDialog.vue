<script setup lang="ts">
import { ref, computed } from "vue";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Info, CheckCircle2 } from "lucide-vue-next";

// 1. 定義與先前一致的型態
export type DialogType = "info" | "success" | "warning" | "error";
export type DialogButtons =
  | "ok"
  | "ok-cancel"
  | "yes-no"
  | "yes-no-cancel"
  | "retry-cancel"
  | "abort-retry-ignore";
export type DialogResult =
  | "ok"
  | "cancel"
  | "yes"
  | "no"
  | "retry"
  | "abort"
  | "ignore";

interface ButtonConfig {
  text: string;
  result: DialogResult;
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

// 2. 定義 Props
const props = withDefaults(
  defineProps<{
    type?: DialogType;
    buttons?: DialogButtons;
    title?: string;
    description?: string;
    customLabels?: Partial<Record<DialogResult, string>>;
    // 這個 callback 用來將使用者的選擇回傳給建立視窗的 Promise
    onResolve: (result: DialogResult) => void;
  }>(),
  {
    type: "info",
    buttons: "ok-cancel",
    title: "提示",
    description: "",
    customLabels: () => ({}),
  },
);

// 控制彈出視窗顯示狀態
const isOpen = ref(true);

// 3. 根據 type 計算圖示與主按鈕樣式
const iconMeta = computed(() => {
  switch (props.type) {
    case "success":
      return {
        icon: CheckCircle2,
        color: "text-green-500",
        mainVariant: "default" as const,
      };
    case "warning":
      return {
        icon: AlertTriangle,
        color: "text-amber-500",
        mainVariant: "default" as const,
      };
    case "error":
      return {
        icon: XCircle,
        color: "text-destructive",
        mainVariant: "destructive" as const,
      };
    case "info":
    default:
      return {
        icon: Info,
        color: "text-blue-500",
        mainVariant: "default" as const,
      };
  }
});

// 預設繁體中文本
const defaultLabels: Record<DialogResult, string> = {
  ok: "確定",
  cancel: "取消",
  yes: "是",
  no: "否",
  retry: "重試",
  abort: "中止",
  ignore: "略過",
};

const getLabel = (key: DialogResult) =>
  props.customLabels[key] || defaultLabels[key];

// 4. 動態計算要顯示的按鈕清單
const btnConfigs = computed<ButtonConfig[]>(() => {
  const configs: ButtonConfig[] = [];
  const mainVar = iconMeta.value.mainVariant;

  switch (props.buttons) {
    case "ok":
      configs.push({ text: getLabel("ok"), result: "ok", variant: mainVar });
      break;
    case "ok-cancel":
      configs.push({
        text: getLabel("cancel"),
        result: "cancel",
        variant: "outline",
      });
      configs.push({ text: getLabel("ok"), result: "ok", variant: mainVar });
      break;
    case "yes-no":
      configs.push({ text: getLabel("no"), result: "no", variant: "outline" });
      configs.push({ text: getLabel("yes"), result: "yes", variant: mainVar });
      break;
    case "yes-no-cancel":
      configs.push({
        text: getLabel("cancel"),
        result: "cancel",
        variant: "ghost",
      });
      configs.push({ text: getLabel("no"), result: "no", variant: "outline" });
      configs.push({ text: getLabel("yes"), result: "yes", variant: mainVar });
      break;
    case "retry-cancel":
      configs.push({
        text: getLabel("cancel"),
        result: "cancel",
        variant: "outline",
      });
      configs.push({
        text: getLabel("retry"),
        result: "retry",
        variant: mainVar,
      });
      break;
    case "abort-retry-ignore":
      configs.push({
        text: getLabel("ignore"),
        result: "ignore",
        variant: "ghost",
      });
      configs.push({
        text: getLabel("abort"),
        result: "abort",
        variant: "destructive",
      });
      configs.push({
        text: getLabel("retry"),
        result: "retry",
        variant: "default",
      });
      break;
  }
  return configs;
});

// 5. 處理使用者點擊按鈕或關閉事件
function handleAction(result: DialogResult) {
  isOpen.value = false;
  props.onResolve(result);
}

function handleOpenUpdate(val: boolean) {
  if (!val) {
    // 當使用者按下 ESC 或點擊外部關閉時，預設回傳最後一個按鈕（通常是取消/否）
    const fallback = btnConfigs.value[0]?.result || "cancel";
    props.onResolve(fallback);
  }
}
</script>

<template>
  <!-- 完美繼承 shadcn-vue 的動畫與外觀 -->
  <AlertDialog :open="isOpen" @update:open="handleOpenUpdate">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2 text-lg font-semibold">
          <!-- 動態圖示組件 -->
          <component
            :is="iconMeta.icon"
            :class="['h-5 w-5 shrink-0', iconMeta.color]"
          />
          <span>{{ title }}</span>
        </AlertDialogTitle>
        <AlertDialogDescription
          class="text-muted-foreground whitespace-pre-line"
        >
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter class="flex flex-row justify-end gap-2">
        <!-- 遍歷渲染按鈕 -->
        <Button
          v-for="btn in btnConfigs"
          :key="btn.result"
          :variant="btn.variant"
          @click="handleAction(btn.result)"
        >
          {{ btn.text }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
