<template>
  <!-- 視窗控制按鈕 -->
  <div id="sh-ui-controls" class="flex pointer-events-auto h-10">
    <button
      id="titlebar-minimize"
      title="minimize"
      class="flex items-center justify-center h-full px-6 hover:bg-white/10 transition-colors duration-200"
    >
      <!-- https://api.iconify.design/mdi:window-minimize.svg -->
      <img :src="minimizeIcon" alt="Minimize" class="h-3 w-3" />
    </button>
    <button
      id="titlebar-maximize"
      title="maximize"
      class="flex items-center justify-center h-full px-6 hover:bg-white/10 transition-colors duration-200"
    >
      <!-- https://api.iconify.design/mdi:window-maximize.svg -->
      <img :src="maximizeIcon" alt="Maximize" class="h-3 w-3" />
    </button>
    <button
      id="titlebar-close"
      title="close"
      class="flex items-center justify-center h-full px-6 hover:bg-red-500/40 transition-colors duration-200"
    >
      <!-- https://api.iconify.design/mdi:close.svg -->
      <img :src="closeIcon" alt="Close" class="h-3 w-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import closeIcon from "@/assets/window/close.svg";
import maximizeIcon from "@/assets/window/maximize.svg";
import minimizeIcon from "@/assets/window/minimize.svg";

import { getCurrentWindow } from "@tauri-apps/api/window";

// when using `"withGlobalTauri": true`, you may use
// const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();

console.log("WindowControlButton mounted, appWindow:", appWindow);

document
  .getElementById("titlebar-minimize")
  ?.addEventListener("click", () => appWindow.minimize());
document
  .getElementById("titlebar-maximize")
  ?.addEventListener("click", () => appWindow.toggleMaximize());
document
  .getElementById("titlebar-close")
  ?.addEventListener("click", () => appWindow.close());
</script>

<style scoped></style>
