<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Plus, RefreshCw } from "@lucide/vue";
import { Button } from "@/components/ui/button";

defineProps<{ busy: boolean; editing: boolean; hasCookies: boolean }>();
const emit = defineEmits<{
  refresh: [];
  add: [];
  confirmClear: [];
}>();
const { t } = useI18n();
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center justify-end gap-2 pr-8">
    <Button
      variant="ghost"
      size="icon"
      :disabled="busy"
      :aria-label="t('cookies.refresh')"
      @click="emit('refresh')"
    >
      <RefreshCw class="size-4" />
    </Button>
    <Button v-if="!editing" :disabled="busy" @click="emit('add')">
      <Plus class="size-4" />{{ t("cookies.add") }}
    </Button>
    <Button
      v-if="!editing"
      variant="destructive"
      :disabled="busy || !hasCookies"
      @click="emit('confirmClear')"
    >
      {{ t("cookies.clear") }}
    </Button>
  </div>
</template>
