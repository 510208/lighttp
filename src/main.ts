import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18n } from "@/i18n";
import { TauriPluginPinia } from "@tauri-store/pinia"; // 引入外掛

import App from "./App.vue";
import "@/styles/index.css";
import router from "@/router";

import VueHex from "vuehex";
import "vuehex/style.css";

const app = createApp(App);

const pinia = createPinia();
pinia.use(TauriPluginPinia());

app.use(pinia);
app.use(i18n);
app.use(router);
app.use(VueHex);
app.mount("#app");
