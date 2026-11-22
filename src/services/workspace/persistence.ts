// 持久化儲存

import { z } from "zod";
import { WorkspaceSchema } from "@/schemas/workspace";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useRequestStore } from "@/stores/useRequestStore";

const STORAGE_KEY = "lighttp.workspace.v1";
const snapshotSchema = z.object({
  version: z.literal(1),
  tabs: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      type: z.literal("request"),
      createdAt: z.number().finite(),
      updatedAt: z.number().finite(),
    }),
  ),
  activeTabId: z.string().uuid().nullable(),
  requests: z.record(z.string().uuid(), WorkspaceSchema),
});

type WorkspaceSnapshot = z.infer<typeof snapshotSchema>;
let restoredSnapshot: WorkspaceSnapshot | null | undefined;

export function restoreWorkspace(): WorkspaceSnapshot | null {
  if (restoredSnapshot !== undefined) return restoredSnapshot;
  restoredSnapshot = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const snapshot = snapshotSchema.parse(JSON.parse(saved));
    const ids = new Set<string>();
    snapshot.tabs = snapshot.tabs.filter((tab) => {
      if (ids.has(tab.id) || !snapshot.requests[tab.id]) return false;
      ids.add(tab.id);
      return true;
    });
    if (!snapshot.activeTabId || !ids.has(snapshot.activeTabId)) {
      snapshot.activeTabId = snapshot.tabs[0]?.id ?? null;
    }
    restoredSnapshot = snapshot;
  } catch (error) {
    console.warn("Failed to restore the request workspace:", error);
  }
  return restoredSnapshot;
}

/** Persist drafts only: responses and pending executions never survive restart. */
export function initializeWorkspacePersistence() {
  const workspace = useWorkspaceStore();
  const requestStore = useRequestStore();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const save = () => {
    clearTimeout(timer);
    try {
      const snapshot: WorkspaceSnapshot = {
        version: 1,
        tabs: workspace.tabs,
        activeTabId: workspace.activeTabId,
        requests: Object.fromEntries(
          workspace.tabs.map((tab) => [
            tab.id,
            requestStore.getRequestDraft(tab.id),
          ]),
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      console.warn("Failed to save the request workspace:", error);
    }
  };
  const scheduleSave = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 300);
  };
  const unsubscribeWorkspace = workspace.$subscribe(scheduleSave, {
    detached: true,
  });
  const unsubscribeRequests = requestStore.$subscribe(scheduleSave, {
    detached: true,
  });
  const saveWhenHidden = () => {
    if (document.visibilityState === "hidden") save();
  };
  document.addEventListener("visibilitychange", saveWhenHidden);
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeunload", save);

  return () => {
    save();
    unsubscribeWorkspace();
    unsubscribeRequests();
    document.removeEventListener("visibilitychange", saveWhenHidden);
    window.removeEventListener("pagehide", save);
    window.removeEventListener("beforeunload", save);
  };
}
