<template>
  <main class="items-left flex h-full flex-col justify-center px-8 py-10">
    <img :src="logo" alt="Logo" class="h-16 w-fit" />
    <Separator class="my-6" />
    <div class="mt-10 flex flex-col items-center gap-2">
      <h1 class="font-space text-3xl font-bold">LigHTTP</h1>
      <small class="text-ctp-subtext1">v{{ appVersion }}</small>
      <p class="text-ctp-subtext1">發送HTTP請求，不用那麼複雜</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import logo from "@/assets/lighttp_logo_wordmark.svg";
import Separator from "@/components/ui/separator/Separator.vue";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";

const appVersion = ref("");

onMounted(async () => {
  appVersion.value = await getVersion();
});
</script>

<style scoped></style>
