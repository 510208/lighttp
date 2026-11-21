<script setup lang="ts">
import Input from "@/components/ui/input/Input.vue";

withDefaults(defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}>(), {
  type: "text",
});

defineEmits<{
  (event: "update:modelValue", value: string | number): void;
}>();
</script>

<template>
  <Input
    v-bind="$attrs"
    :model-value="modelValue"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
