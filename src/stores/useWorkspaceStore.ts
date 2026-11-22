import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { WorkspaceTab } from "@/types/workspace";
import { restoreWorkspace } from "@/services/workspace/persistence";
import { useRequestStore } from "./useRequestStore";
import { useResponseStore } from "./useResponseStore";
import { useExecutionStore } from "./useExecutionStore";

function createWorkspaceTab(): WorkspaceTab {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "",
    type: "request",
    createdAt: now,
    updatedAt: now,
  };
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const restored = restoreWorkspace();
  const tabs = ref<WorkspaceTab[]>(restored?.tabs ?? [createWorkspaceTab()]);
  const activeTabId = ref<string | null>(
    restored ? restored.activeTabId : tabs.value[0].id,
  );
  const activeTab = computed(() =>
    tabs.value.find((tab) => tab.id === activeTabId.value),
  );

  function createTab() {
    const tab = createWorkspaceTab();
    useRequestStore().initializeRequest(tab.id);
    useResponseStore().initializeResponse(tab.id);
    tabs.value.push(tab);
    activeTabId.value = tab.id;
    return tab.id;
  }

  function activateTab(tabId: string) {
    if (tabs.value.some((tab) => tab.id === tabId)) activeTabId.value = tabId;
  }

  function closeTab(tabId: string) {
    const index = tabs.value.findIndex((tab) => tab.id === tabId);
    if (index === -1) return;
    useExecutionStore().deleteTabExecution(tabId);
    if (activeTabId.value === tabId) {
      activeTabId.value =
        tabs.value[index + 1]?.id ?? tabs.value[index - 1]?.id ?? null;
    }
    useRequestStore().deleteRequest(tabId);
    useResponseStore().deleteResponse(tabId);
    tabs.value.splice(index, 1);
  }

  function closeOtherTabs(tabId: string) {
    if (!tabs.value.some((tab) => tab.id === tabId)) return;
    tabs.value
      .filter((tab) => tab.id !== tabId)
      .forEach((tab) => closeTab(tab.id));
  }

  function closeTabsToRight(tabId: string) {
    const index = tabs.value.findIndex((tab) => tab.id === tabId);
    if (index !== -1)
      tabs.value.slice(index + 1).forEach((tab) => closeTab(tab.id));
  }

  function closeAllTabs() {
    [...tabs.value].forEach((tab) => closeTab(tab.id));
  }

  function reorderTabs(oldIndex: number, newIndex: number) {
    if (
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= tabs.value.length ||
      newIndex >= tabs.value.length ||
      oldIndex === newIndex
    )
      return;
    const [tab] = tabs.value.splice(oldIndex, 1);
    tabs.value.splice(newIndex, 0, tab);
  }

  function cycleTabs(offset: number) {
    if (!tabs.value.length) return;
    const current = tabs.value.findIndex((tab) => tab.id === activeTabId.value);
    const index = (current + offset + tabs.value.length) % tabs.value.length;
    activateTab(tabs.value[index].id);
  }

  function touchTab(tabId: string) {
    const tab = tabs.value.find((tab) => tab.id === tabId);
    if (tab) tab.updatedAt = Date.now();
  }

  function updateTabTitle(tabId: string, title: string) {
    const tab = tabs.value.find((tab) => tab.id === tabId);
    if (tab) {
      tab.title = title.trim();
      touchTab(tabId);
    }
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    createTab,
    activateTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
    reorderTabs,
    cycleTabs,
    touchTab,
    updateTabTitle,
  };
});
