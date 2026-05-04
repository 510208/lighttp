<template>
  <div
    class="bg-ctp-base absolute bottom-0 left-0 flex h-6 w-full items-center justify-between"
  >
    <!-- 左側 -->
    <div class="flex h-full items-center gap-1 text-sm">
      <StatusBadge
        :status="leftSideStatus.statProp"
        :icon="leftSideStatus.icon"
      >
        {{ leftSideStatus.content }}</StatusBadge
      >

      <StatusBadge v-if="requestTime !== null" status="none" :icon="Timer">
        {{ requestTime.toFixed(3) }} ms
      </StatusBadge>
    </div>

    <!-- 右側 -->
    <div class="flex h-full items-center gap-1 text-sm">
      <button
        type="button"
        class="hover:bg-ctp-surface0 flex h-full items-center gap-1 px-2 text-xs transition-colors"
        @click="$emit('toggle-response-panel')"
      >
        <ChevronDown
          :size="16"
          :class="{ 'rotate-180': !props.responseOpen }"
        />
        {{ props.responseOpen ? "收合回應面板" : "展開回應面板" }}
      </button>

      <StatusBadge status="none">Lighttp v{{ appVersion }}</StatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from "@/components/StatusBar/StatusBadge.vue";
import { getVersion } from "@tauri-apps/api/app";
import {
  ChevronDown,
  Ellipsis,
  CheckCircle,
  ServerOff,
  PcCase,
  Loader,
  Plug,
  Timer,
} from "@lucide/vue";

import { useResponseStore } from "@/stores/useResponseStore";
import { watch, ref, onMounted } from "vue";

const responseStore = useResponseStore();

const requestTime = ref<number | null>(null);
const leftSideStatus = ref({
  statProp: "ready", // 預設為 ready
  icon: Ellipsis,
  content: "已就緒", // 預設顯示 Ready
} as {
  statProp: "ready" | "error" | "success" | "loading" | "none";
  icon?: any; // 圖標為lucide圖標組件
  content: string;
});

const appVersion = ref("");

onMounted(async () => {
  appVersion.value = await getVersion();
});

// 監視 responseStore 的 status 屬性，當它改變時修改左側的狀態顯示
watch(
  () => responseStore.status,
  (newStatus) => {
    //#region status內為HTTP狀態碼，當為null時表示ready狀態
    if (newStatus === null) {
      // 當 status 是 "ready" 時，顯示 Ready
      leftSideStatus.value.statProp = "ready";
      leftSideStatus.value.content = "已就緒";
      leftSideStatus.value.icon = Ellipsis;
    } else if (newStatus === undefined) {
      leftSideStatus.value.statProp = "loading";
      leftSideStatus.value.content = "等待中";
      leftSideStatus.value.icon = Plug;
    } else if (newStatus >= 200 && newStatus < 300) {
      leftSideStatus.value.statProp = "success";
      leftSideStatus.value.content = `成功 (${newStatus})`;
      leftSideStatus.value.icon = CheckCircle;
    } else if (newStatus >= 400 && newStatus < 500) {
      leftSideStatus.value.statProp = "error";
      leftSideStatus.value.content = `客戶端錯誤 (${newStatus})`;
      leftSideStatus.value.icon = PcCase;
    } else if (newStatus >= 500 && newStatus < 600) {
      leftSideStatus.value.statProp = "error";
      leftSideStatus.value.content = `伺服器錯誤 (${newStatus})`;
      leftSideStatus.value.icon = ServerOff;
    } else {
      // 其他狀態顯示 None
      leftSideStatus.value.statProp = "none";
      leftSideStatus.value.content = "無狀態";
      leftSideStatus.value.icon = Loader;
    }
    //#endregion
  },
);

// 監視 responseStore 的 requestTime 屬性，當它改變時更新 requestTime 變數
watch(
  () => responseStore.timeTaken,
  (newRequestTime) => {
    requestTime.value = newRequestTime;
  },
);

const props = defineProps<{
  responseOpen: boolean;
}>();

defineEmits<{
  (e: "toggle-response-panel"): void;
}>();
</script>

<style scoped></style>
