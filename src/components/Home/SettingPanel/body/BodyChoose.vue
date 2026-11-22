<template>
  <Select
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as string)"
  >
    <SelectTrigger size="sm">
      <SelectValue
        :placeholder="$t('home.settings_panel.tabs.body.choose_placeholder')"
      />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="method in bodyMethods"
        :key="method.value"
        :value="method.value"
      >
        {{ method.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { bodyMethods } from "@/constants/methods.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>
