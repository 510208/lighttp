<script setup lang="ts">
import { Slider } from "@/components/ui/slider";

const modelValue = defineModel<number[]>({ required: true });

defineProps<{
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}>();
</script>

<template>
  <Slider
    v-bind="$attrs"
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:model-value="
      (val) => {
        if (val !== undefined) modelValue = val;
      }
    "
  />
</template>
