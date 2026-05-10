<template>
  <router-view></router-view>

  <Toaster
    position="bottom-right"
    :closeButton="true"
    closeButtonPosition="top-right"
  />
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
</script>

<style scoped></style>
