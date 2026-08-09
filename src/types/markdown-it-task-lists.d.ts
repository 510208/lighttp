declare module "markdown-it-task-lists" {
  import type { PluginWithOptions } from "markdown-it";

  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
    lineNumber?: boolean;
  }

  const taskLists: PluginWithOptions;
  export default taskLists;
}
