<script setup lang="ts">
import { Slider } from "@/components/ui/slider";

defineProps<{
  modelValue: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}>();

defineEmits<{
  (event: "update:modelValue", value: number[]): void;
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
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
