<script setup lang="ts">
import TitleBar from "@/components/core/TitleBar.vue";
import RequestBuilder from "@/layouts/RequestBuilder.vue";

import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <main>
    <TitleBar />
    <RequestBuilder />
  </main>

  <Toaster
    position="bottom-right"
    :closeButton="true"
    closeButtonPosition="top-right"
  />
</template>
