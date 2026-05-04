<script setup lang="ts">
import TitleBar from "@/components/core/TitleBar.vue";
import RequestBuilder from "@/layouts/RequestBuilder.vue";

import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
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
