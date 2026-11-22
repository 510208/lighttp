<script setup lang="ts">
import { computed } from "vue";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "reka-ui";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

const props = defineProps<{ tabId: string }>();
const workspace = useWorkspaceStore();
const index = computed(() =>
  workspace.tabs.findIndex((tab) => tab.id === props.tabId),
);
const itemClass =
  "text-lh-text data-[highlighted]:bg-lh-surface-1 data-[disabled]:opacity-40 data-[disabled]:pointer-events-none cursor-pointer rounded-sm px-3 py-2 text-xs outline-none";
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child><slot /></ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent
        class="bg-lh-mantle border-lh-surface-1 z-50 min-w-48 rounded-lg border p-1 shadow-lg"
      >
        <ContextMenuItem
          :class="itemClass"
          @select="workspace.closeTab(tabId)"
          >{{ $t("home.workspace.close_tab") }}</ContextMenuItem
        >
        <ContextMenuItem
          :class="itemClass"
          :disabled="workspace.tabs.length < 2"
          @select="workspace.closeOtherTabs(tabId)"
          >{{ $t("home.workspace.close_others") }}</ContextMenuItem
        >
        <ContextMenuItem
          :class="itemClass"
          :disabled="index < 0 || index >= workspace.tabs.length - 1"
          @select="workspace.closeTabsToRight(tabId)"
          >{{ $t("home.workspace.close_below") }}</ContextMenuItem
        >
        <ContextMenuSeparator class="bg-lh-surface-1 my-1 h-px" />
        <ContextMenuItem
          :class="itemClass"
          :disabled="!workspace.tabs.length"
          @select="workspace.closeAllTabs()"
          >{{ $t("home.workspace.close_all") }}</ContextMenuItem
        >
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
