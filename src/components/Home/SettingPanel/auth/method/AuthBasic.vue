<template>
  <div class="flex h-full w-full flex-col gap-4 p-1">
    <p class="font-bold">
      {{ $t("home.settings_panel.tabs.auth.basic.title") }}
    </p>
    <div class="flex flex-col">
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">{{
          $t("home.settings_panel.tabs.auth.basic.username_label")
        }}</span>
        <Input
          v-model="username"
          :placeholder="
            $t('home.settings_panel.tabs.auth.basic.username_placeholder')
          "
          class="w-full"
        />
      </div>
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">{{
          $t("home.settings_panel.tabs.auth.basic.password_label")
        }}</span>
        <Input
          v-model="password"
          :placeholder="
            $t('home.settings_panel.tabs.auth.basic.password_placeholder')
          "
          type="password"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/useRequestStore.ts";
import { computed } from "vue";
import { type BasicAuthContent } from "@/stores/authType";

const requestStore = useRequestStore();

// 使用 Computed 進行雙向綁定，直接存取 Store 內的 content
const username = computed({
  get: () => (requestStore.auth.content as BasicAuthContent).username || "",
  set: (val) => {
    (requestStore.auth.content as BasicAuthContent).username = val;
  },
});

const password = computed({
  get: () => (requestStore.auth.content as BasicAuthContent).password || "",
  set: (val) => {
    (requestStore.auth.content as BasicAuthContent).password = val;
  },
});
</script>
