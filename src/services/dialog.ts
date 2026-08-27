import { createVNode, render } from "vue";
import PopDialogComponent from "@/components/common/PopDialog.vue";
import type {
  DialogType,
  DialogButtons,
  DialogResult,
} from "@/components/common/PopDialog.vue";

interface PopDialogOptions {
  type?: DialogType;
  buttons?: DialogButtons;
  title?: string;
  description?: string;
  customLabels?: Partial<Record<DialogResult, string>>;
}

/**
 * 命令式呼叫 Vue 元件對話框
 */
export function popDialog(
  options: PopDialogOptions = {},
): Promise<DialogResult> {
  return new Promise((resolve) => {
    // 建立一個臨時容器
    const container = document.createElement("div");
    document.body.appendChild(container);

    // 清理與卸載函式
    const destroy = () => {
      render(null, container); // 卸載 Vue 元件
      container.remove(); // 移除 DOM 節點
    };

    // 將我們的 Vue 元件轉換為 VNode，並把參數當作 Props 傳入
    const vnode = createVNode(PopDialogComponent, {
      ...options,
      // 當元件內部點擊按鈕，觸發 resolved 時
      onResolve: (result: DialogResult) => {
        resolve(result);
        // 為了讓關閉動畫順暢播放完畢，稍微延遲銷毀 DOM (預設動畫通常小於 200ms)
        setTimeout(destroy, 200);
      },
    });

    // 渲染至網頁中
    render(vnode, container);
  });
}
