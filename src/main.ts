import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18n } from "@/i18n";
import { TauriPluginPinia } from "@tauri-store/pinia";

import App from "./App.vue";
import "@/styles/index.css";
import router from "@/router";

import VueHex from "vuehex";
import "vuehex/style.css";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { applyColorTheme } from "@/services/colorTheme";

async function bootstrap() {
  const app = createApp(App);

  const pinia = createPinia();
  pinia.use(TauriPluginPinia());

  app.use(pinia);

  // 初始化設定儲存系統
  const settingsStore = useSettingsStore(pinia);
  await settingsStore.$tauri.start();

  // 套用使用者主題
  applyColorTheme(settingsStore.colorTheme.css);

  // 初始化其他 Plugin
  app.use(i18n);
  app.use(router);
  app.use(VueHex);

  app.mount("#app");
}

bootstrap().catch((error) => {
  console.error("Failed to initialize LigHTTP:", error);
});
