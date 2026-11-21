<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from "reka-ui";
import { Switch } from "@/components/ui/switch";

defineProps<SwitchRootProps>();
const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();
</script>

<template>
  <Switch
    v-bind="$attrs"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
