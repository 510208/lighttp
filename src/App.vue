<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "./components/core/TitleBar.vue";

const greetMsg = ref("");
const name = ref("");
</script>

<template>
  <main>
    <TitleBar />
  </main>
</template>
