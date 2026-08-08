<script setup lang="ts">
import type { SplitterPanelEmits, SplitterPanelProps } from "reka-ui";
import { SplitterPanel, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import { ref } from "vue";

const props = defineProps<SplitterPanelProps>();
const emits = defineEmits<SplitterPanelEmits>();

const forwarded = useForwardPropsEmits(props, emits);

// 建立實體 ref 取得 SplitterPanel
const panelRef = ref<InstanceType<typeof SplitterPanel> | null>(null);

// 使用 useForwardExpose，並透過 forwardRef 綁定面板實體
// useForwardExpose 內部會統一處理全域 expose，不需再手動呼叫 defineExpose
const { forwardRef } = useForwardExpose();

// 合併 ref 綁定，同時提供給 Reka UI 的 forwardRef 與內部的 panelRef
const setRef = (el: any) => {
  panelRef.value = el;
  forwardRef(el);
};
</script>

<template>
  <SplitterPanel
    :ref="setRef"
    v-slot="slotProps"
    data-slot="resizable-panel"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </SplitterPanel>
</template>
