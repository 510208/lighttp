import { type Ref } from "vue";

export interface KeyValuePair {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
}

/**
 * 通用的表格資料管理工具
 * @param dataRef 指向 Store 裡的 ref 陣列
 * @param onUpdate 當資料變動時執行的回調函數 (例如同步 URL)
 */
export function useTableManager(
  dataRef: Ref<KeyValuePair[]>,
  onUpdate?: () => void,
) {
  const createItem = (key = "", value = "", enabled = true): KeyValuePair => ({
    id: crypto.randomUUID(),
    enabled,
    key,
    value,
  });

  const add = (defaultKeyPrefix = "item", defaultValue = "value") => {
    const newKey = `${defaultKeyPrefix}${dataRef.value.length + 1}`;
    dataRef.value.push(createItem(newKey, defaultValue));
    onUpdate?.();
  };

  const remove = (id: string) => {
    console.log("Removing item with id:", id);
    console.log("Before removal, dataRef.value:", dataRef.value);
    dataRef.value = dataRef.value.filter((item) => item.id !== id);
    onUpdate?.();
  };

  const toggle = (id: string) => {
    // console.log("Toggling item with id:", id);
    const item = dataRef.value.find((p) => p.id === id);
    if (item) {
      item.enabled = !item.enabled;
      onUpdate?.();
    }
  };

  const update = (
    id: string,
    updates: Partial<Pick<KeyValuePair, "key" | "value">>,
  ) => {
    // console.log("Updating item with id:", id, "Updates:", updates);
    const item = dataRef.value.find((p) => p.id === id);
    if (item) {
      Object.assign(item, updates);
      onUpdate?.();
    }
  };

  return { add, remove, toggle, update };
}
