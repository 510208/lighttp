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
import { i18n } from "@/i18n";

const { t } = i18n.global;

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

// 預設值改為靜態常數（如空字串）避免編譯報錯
const props = withDefaults(
  defineProps<{
    type?: DialogType;
    buttons?: DialogButtons;
    title?: string;
    description?: string;
    customLabels?: Partial<Record<DialogResult, string>>;
    onResolve: (result: DialogResult) => void;
  }>(),
  {
    type: "info",
    buttons: "ok-cancel",
    title: "", // 改為空字串，避開提升限制
    description: "",
    customLabels: () => ({}),
  },
);

// 若外部有傳入就用傳入的，否則採用 i18n 預設值
const displayTitle = computed(() => {
  return props.title || t("pop_dialog.title.default");
});

// 控制彈出視窗顯示狀態
const isOpen = ref(true);

// 根據 type 計算圖示與主按鈕樣式
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

// 將 i18n 翻譯字典放入 computed 中，每次渲染時動態取得
const defaultLabels = computed<Record<DialogResult, string>>(() => ({
  ok: t("pop_dialog.label.ok"),
  cancel: t("pop_dialog.label.cancel"),
  yes: t("pop_dialog.label.yes"),
  no: t("pop_dialog.label.no"),
  retry: t("pop_dialog.label.retry"),
  abort: t("pop_dialog.label.abort"),
  ignore: t("pop_dialog.label.ignore"),
}));

const getLabel = (key: DialogResult) =>
  props.customLabels[key] || defaultLabels.value[key];

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

// 處理使用者點擊按鈕或關閉事件
function handleAction(result: DialogResult) {
  isOpen.value = false;
  props.onResolve(result);
}

function handleOpenUpdate(val: boolean) {
  if (!val) {
    const fallback = btnConfigs.value[0]?.result || "cancel";
    props.onResolve(fallback);
  }
}
</script>

<template>
  <AlertDialog :open="isOpen" @update:open="handleOpenUpdate">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2 text-lg font-semibold">
          <component
            :is="iconMeta.icon"
            :class="['h-5 w-5 shrink-0', iconMeta.color]"
          />
          <!-- 使用動態計算的 displayTitle -->
          <span>{{ displayTitle }}</span>
        </AlertDialogTitle>
        <!-- 保留前一節課製的 \n 換行支援 -->
        <AlertDialogDescription
          class="text-muted-foreground whitespace-pre-line"
        >
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter class="flex flex-row justify-end gap-2">
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
