<script setup lang="ts">
import type { ButtonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

withDefaults(defineProps<{
  label?: string;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  disabled?: boolean;
}>(), {
  variant: "outline",
  size: "default",
});
</script>

<template>
  <Button
    v-bind="$attrs"
    :variant="variant"
    :size="size"
    :disabled="disabled"
  >
    <slot>{{ label }}</slot>
  </Button>
</template>
