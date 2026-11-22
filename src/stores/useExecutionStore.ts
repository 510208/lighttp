import { defineStore } from "pinia";
import { ref } from "vue";
import type { RequestExecution } from "@/types/workspace";

export const useExecutionStore = defineStore("execution", () => {
  const executions = ref<Record<string, RequestExecution>>({});
  const controllers = new Map<string, AbortController>();

  function cancelTabExecutions(tabId: string) {
    const execution = executions.value[tabId];
    if (!execution || execution.status !== "pending") return;
    execution.status = "cancelled";
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    controllers.get(execution.id)?.abort();
    controllers.delete(execution.id);
  }

  function startExecution(tabId: string) {
    cancelTabExecutions(tabId);
    const id = crypto.randomUUID();
    controllers.set(id, new AbortController());
    executions.value[tabId] = {
      id,
      tabId,
      status: "pending",
      startedAt: Date.now(),
      completedAt: null,
      duration: null,
      error: null,
    };
    return id;
  }

  function isCurrent(tabId: string, requestId: string) {
    const execution = executions.value[tabId];
    return execution?.id === requestId && execution.status === "pending";
  }

  function finishExecution(
    tabId: string,
    requestId: string,
    error: string | null = null,
  ) {
    if (!isCurrent(tabId, requestId)) return;
    const execution = executions.value[tabId];
    execution.status = error === null ? "success" : "error";
    execution.error = error;
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    controllers.delete(requestId);
  }

  function deleteTabExecution(tabId: string) {
    cancelTabExecutions(tabId);
    delete executions.value[tabId];
  }

  function getSignal(requestId: string) {
    return controllers.get(requestId)?.signal;
  }

  return {
    executions,
    startExecution,
    cancelTabExecutions,
    deleteTabExecution,
    finishExecution,
    isCurrent,
    getSignal,
  };
});
