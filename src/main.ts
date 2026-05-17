import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18n } from "@/i18n";

import App from "./App.vue";
import "@/styles/index.css";
import router from "@/router";

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(router);
app.mount("#app");
