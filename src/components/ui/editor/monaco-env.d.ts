declare module "monaco-editor/esm/vs/language/*/monaco.contribution" {
  const content: any;
  export default content;
}

declare module "monaco-editor/esm/vs/basic-languages/*/*.contribution" {
  const content: any;
  export default content;
}

declare module "monaco-editor/esm/vs/*.js" {
  const content: any;
  export default content;
}

declare module "monaco-editor/esm/vs/editor/editor.api" {
  export * from "monaco-editor";
}

declare module "monaco-editor/esm/vs/editor/editor.worker?worker" {
  const workerWorker: new () => Worker;
  export default workerWorker;
}

declare module "monaco-editor/esm/vs/language/json/json.worker?worker" {
  const jsonWorker: new () => Worker;
  export default jsonWorker;
}

declare module "monaco-editor/esm/vs/language/css/css.worker?worker" {
  const cssWorker: new () => Worker;
  export default cssWorker;
}

declare module "monaco-editor/esm/vs/language/html/html.worker?worker" {
  const htmlWorker: new () => Worker;
  export default htmlWorker;
}

declare module "monaco-editor/esm/vs/language/typescript/ts.worker?worker" {
  const tsWorker: new () => Worker;
  export default tsWorker;
}
