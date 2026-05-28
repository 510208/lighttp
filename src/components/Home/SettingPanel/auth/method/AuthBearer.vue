<template>
  <div class="flex h-full w-full flex-col gap-4 p-1">
    <p class="font-bold">
      {{ $t("home.settings_panel.tabs.auth.bearer.title") }}
    </p>
    <div class="flex flex-col">
      <div class="mb-4 flex flex-col gap-1 lg:flex-row lg:items-center">
        <span class="text-sm font-semibold lg:min-w-[100px]">
          {{ $t("home.settings_panel.tabs.auth.bearer.token_label") }}
        </span>
        <div class="flex w-full flex-col gap-2">
          <Input
            v-model="token"
            :placeholder="
              $t('home.settings_panel.tabs.auth.bearer.token_placeholder')
            "
            class="w-full"
          />
          <span class="text-muted-foreground text-xs">
            {{ $t("home.settings_panel.tabs.auth.bearer.hint") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/useRequestStore.ts";
import { computed } from "vue";
import { type BearerAuthContent } from "@/stores/authType";

const requestStore = useRequestStore();

// 使用 computed 雙向綁定，直接存取 Store 內的 content
const token = computed({
  get: () => (requestStore.auth.content as BearerAuthContent).token || "",
  set: (val) => {
    // 斷言為 BearerAuthContent 並直接修改屬性，保持引用穩定
    (requestStore.auth.content as BearerAuthContent).token = val;
  },
});
</script>

<style scoped></style>
