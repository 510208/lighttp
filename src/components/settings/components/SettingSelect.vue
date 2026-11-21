<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SettingSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

defineProps<{
  modelValue?: string;
  options: SettingSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  triggerClass?: string;
}>();

defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <Select
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', String($event))"
  >
    <SelectTrigger :class="triggerClass ?? 'min-w-32'">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
