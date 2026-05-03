<template>
  <Select
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as string)"
  >
    <SelectTrigger size="sm">
      <SelectValue placeholder="選擇內容類型" />
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
import { bodyMethods } from "@/constants/methods";
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
