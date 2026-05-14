<template>
  <main class="items-left flex h-full flex-col px-8 pt-20">
    <div class="flex items-center justify-center">
      <img :src="logo" alt="Logo" class="h-16 w-fit" />
    </div>
    <Separator class="my-6" />
    <div class="flex flex-col items-center gap-2">
      <h1 class="font-space text-3xl font-bold">LigHTTP</h1>
      <small class="text-ctp-subtext1">v{{ appVersion }}</small>
      <p class="text-ctp-subtext1">將 HTTP 請求做到簡單，使調用 API 更輕鬆</p>
    </div>
    <div
      class="absolute right-0 bottom-0 left-0 flex flex-col items-center gap-4 p-4"
    >
      <p>特別感謝以下協助者們：</p>
      <ul class="text-ctp-subtext1 min-w-40 list-disc">
        <li class="flex items-center gap-2">
          <a
            href="https://510208.github.io/"
            class="flex w-fit items-center gap-1 font-bold text-white hover:underline"
            target="_blank"
          >
            <img
              src="https://gravatar.com/avatar/f7598bd8d4aba38d7219341f81a162fc842376b3b556b1995cbb97271d9e2915?v=1753291388000"
              alt="SamHacker Avatar"
              class="h-5 w-5 rounded-full"
            />
            <p>SamHacker</p>
          </a>
          - 也就是我，開發者本人 :D
        </li>
        <li class="flex items-center gap-2">
          <a
            href="https://zhenyuan.dev/"
            class="flex w-fit items-center gap-1 font-bold text-white hover:underline"
            target="_blank"
          >
            <img
              src="https://gravatar.com/avatar/07f375105a68074c6b90379762cd1443"
              alt="Zhenyuan Avatar"
              class="h-5 w-5 rounded-full"
            />
            <p>Zhenyuan</p>
          </a>
          - 協助測試 Mac OS 版本
        </li>
        <li class="flex items-center gap-2">
          <a
            href="https://github.com/owoDennis911"
            class="flex w-fit items-center gap-1 font-bold text-white hover:underline"
            target="_blank"
          >
            <img
              src="https://github.com/owoDennis911.png"
              alt="Dennis911 Avatar"
              class="h-5 w-5 rounded-full"
            />
            <p>Dennis911</p>
          </a>
          - 提供開發過程的建議
        </li>
      </ul>
      <Button @click="closeWindow" class="w-full">關閉</Button>
    </div>
  </main>
</template>

<script setup lang="ts">
import logo from "@/assets/lighttp_logo_wordmark.svg";
import Button from "@/components/ui/button/Button.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";
import { Window } from "@tauri-apps/api/window";

const appVersion = ref("");

onMounted(async () => {
  appVersion.value = await getVersion();
});

function closeWindow() {
  const appWindow = Window.getCurrent();
  appWindow.close();
}
</script>

<style scoped></style>
