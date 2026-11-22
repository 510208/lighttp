<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useRequestStore } from "@/stores/useRequestStore";
import { useExecutionStore } from "@/stores/useExecutionStore";
import BrowserTab from "./BrowserTab.vue";
import BrowserTabActions from "./BrowserTabActions.vue";
import BrowserTabContextMenu from "./BrowserTabContextMenu.vue";
import type { WorkspaceTab } from "@/types/workspace";

const workspace = useWorkspaceStore();
const requestStore = useRequestStore();
const executionStore = useExecutionStore();
const { t } = useI18n();
const tabList = ref<HTMLElement | null>(null);
const draggedTabId = ref<string | null>(null);
const dropTarget = ref<{ tabId: string; position: "before" | "after" } | null>(
  null,
);
let lastWheelSwitch = -Infinity;
let wheelDelta = 0;
let lastWheelEvent = -Infinity;

function switchWithWheel(event: WheelEvent) {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    draggedTabId.value ||
    workspace.tabs.length < 2
  )
    return;
  const delta =
    Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;
  if (!delta) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheelEvent > 180 || Math.sign(delta) !== Math.sign(wheelDelta))
    wheelDelta = 0;
  lastWheelEvent = now;
  // Normalize mouse wheels and touchpads; avoid racing through tabs on momentum.
  wheelDelta +=
    delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
  if (now - lastWheelSwitch < 160) {
    wheelDelta = 0;
    return;
  }
  if (Math.abs(wheelDelta) < 24) return;
  workspace.cycleTabs(wheelDelta > 0 ? 1 : -1);
  lastWheelSwitch = now;
  wheelDelta = 0;
}
const dragType = "application/x-lighttp-tab";

function titleFor(tab: WorkspaceTab) {
  return (
    tab.title ||
    requestStore.getRequest(tab.id)?.url ||
    t("home.workspace.untitled")
  );
}

function finishDrag() {
  draggedTabId.value = null;
  dropTarget.value = null;
}

function startDrag(tabId: string, event: DragEvent) {
  if (!event.dataTransfer) return;
  draggedTabId.value = tabId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(dragType, tabId);
}

function dragOver(tabId: string, event: DragEvent) {
  if (!draggedTabId.value || draggedTabId.value === tabId) {
    dropTarget.value = null;
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  dropTarget.value = {
    tabId,
    position: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
  };
  const list = tabList.value;
  if (list) {
    const bounds = list.getBoundingClientRect();
    if (event.clientY < bounds.top + 28) list.scrollTop -= 20;
    if (event.clientY > bounds.bottom - 28) list.scrollTop += 20;
  }
}
function drop(event: DragEvent) {
  event.preventDefault();
  const target = dropTarget.value;
  const sourceId = event.dataTransfer?.getData(dragType);
  if (
    target &&
    sourceId &&
    sourceId !== target.tabId &&
    sourceId === draggedTabId.value
  ) {
    const from = workspace.tabs.findIndex((tab) => tab.id === sourceId);
    const targetIndex = workspace.tabs.findIndex(
      (tab) => tab.id === target.tabId,
    );
    let to = targetIndex + (target.position === "after" ? 1 : 0);
    if (from < to) to--;
    workspace.reorderTabs(from, to);
  }
  finishDrag();
}
function leaveDrag(event: DragEvent) {
  if (
    !(event.relatedTarget instanceof Node) ||
    !tabList.value?.contains(event.relatedTarget)
  )
    dropTarget.value = null;
}
function navigate(tabId: string, event: KeyboardEvent) {
  const index = workspace.tabs.findIndex((tab) => tab.id === tabId);
  let nextIndex = index;
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (event.key === "ArrowDown")
    nextIndex = (index + 1) % workspace.tabs.length;
  else if (event.key === "ArrowUp")
    nextIndex = (index - 1 + workspace.tabs.length) % workspace.tabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = workspace.tabs.length - 1;
  else if (event.key === "Delete") {
    event.preventDefault();
    workspace.closeTab(tabId);
    return;
  } else return;
  event.preventDefault();
  const nextTab = workspace.tabs[nextIndex];
  if (!nextTab) return;
  workspace.activateTab(nextTab.id);
  document.getElementById("workspace-tab-" + nextTab.id)?.focus();
}
watch(
  () => workspace.activeTabId,
  async (tabId) => {
    await nextTick();
    if (tabId)
      document
        .getElementById("workspace-tab-" + tabId)
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  },
  { flush: "post", immediate: true },
);
</script>

<template>
  <aside
    class="flex h-full min-h-0 w-11 shrink-0 flex-col px-1.5 py-5"
    :aria-label="$t('home.workspace.tabs')"
    @wheel="switchWithWheel"
  >
    <TooltipProvider :delay-duration="250">
      <div
        ref="tabList"
        role="tablist"
        aria-orientation="vertical"
        :aria-label="
          $t('home.workspace.tab_count', { count: workspace.tabs.length })
        "
        class="flex min-h-0 flex-col gap-1 overflow-x-hidden overflow-y-auto pb-1"
        @dragend="finishDrag"
        @dragleave="leaveDrag"
      >
        <BrowserTabContextMenu
          v-for="(tab, index) in workspace.tabs"
          :key="tab.id"
          :tab-id="tab.id"
        >
          <BrowserTab
            :tab="tab"
            :title="titleFor(tab)"
            :method="requestStore.getRequest(tab.id)?.method ?? 'GET'"
            :url="requestStore.getRequest(tab.id)?.url ?? ''"
            :active="workspace.activeTabId === tab.id"
            :status="executionStore.executions[tab.id]?.status ?? 'idle'"
            :dragging="draggedTabId === tab.id"
            :drop-position="
              dropTarget?.tabId === tab.id ? dropTarget.position : null
            "
            :position="index + 1"
            :total="workspace.tabs.length"
            @activate="workspace.activateTab(tab.id)"
            @close="workspace.closeTab(tab.id)"
            @dragstart="startDrag(tab.id, $event)"
            @dragend="finishDrag"
            @dragover="dragOver(tab.id, $event)"
            @drop="drop"
            @navigate="navigate(tab.id, $event)"
          />
        </BrowserTabContextMenu>
      </div>
      <BrowserTabActions @create="workspace.createTab()" />
    </TooltipProvider>
  </aside>
</template>
