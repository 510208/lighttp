<template>
  <section
    class="text-lh-subtext-0 flex min-w-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
  >
    <div class="flex flex-col gap-2">
      <img :src="logo" alt="Logo" class="pointer-events-none w-64" />
      <span class="text-lh-overlay-0">Version {{ version }}</span>
    </div>
    <p class="max-w-sm text-base">
      {{ $t("home.workspace.empty_description") }}
    </p>
    <Button @click="workspace.createTab()">
      <Plus class="size-4" />{{ $t("home.workspace.new_request") }}
    </Button>
    <i18n-t
      keypath="home.workspace.author_hint"
      tag="p"
      class="text-lh-overlay-1 text-xs"
    >
      <template #author>
        <a
          href="https://example.com/samhacker"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:opacity-80"
          >SamHacker</a
        >
      </template>
    </i18n-t>
  </section>
</template>

<script setup>
import logo from "@/assets/lighttp_logo_monocolor.svg";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { Plus } from "@lucide/vue";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";

const version = ref("?.?.?");
onMounted(async () => {
  version.value = await getVersion();
});

const workspace = useWorkspaceStore();
</script>
