<script setup lang="ts">
import { FileUp, X } from "@lucide/vue";
import Button from "@/components/ui/button/Button.vue";

defineProps<{ filePath: string | null }>();
defineEmits<{ select: []; remove: [] }>();
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2">
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" @click="$emit('select')">
        <FileUp :size="16" />
        {{
          $t(
            filePath
              ? "home.settings_panel.tabs.body.replace_file"
              : "home.settings_panel.tabs.body.select_file",
          )
        }}
      </Button>
      <Button
        v-if="filePath"
        variant="ghost"
        size="icon-sm"
        :aria-label="$t('home.settings_panel.tabs.body.remove_file')"
        @click="$emit('remove')"
      >
        <X :size="16" />
      </Button>
    </div>
    <span
      class="text-lh-subtext-1 text-xs break-all"
      :title="filePath ?? undefined"
    >
      {{ filePath || $t("home.settings_panel.tabs.body.no_file") }}
    </span>
  </div>
</template>
