import { defineStore } from "pinia";
import { ref } from "vue";
import { listCookies } from "@/services/cookies";
import type { ManagedCookie } from "@/types/cookies";

export const useCookieStore = defineStore(
  "cookies",
  () => {
    const managerOpen = ref(false);
    const cookies = ref<ManagedCookie[]>([]);
    const revision = ref(0);
    let refreshId = 0;

    async function refresh() {
      const id = ++refreshId;
      const result = await listCookies();
      if (id !== refreshId) return;
      // 前端僅保留顯示用快取，持久儲存及網址匹配皆由 Rust 決定。
      cookies.value = result;
      revision.value++;
    }

    return { managerOpen, cookies, revision, refresh };
  },
  {
    tauri: { autoStart: false, save: false, sync: false },
  },
);
