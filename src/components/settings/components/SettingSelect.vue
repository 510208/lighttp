<script setup lang="ts">
import { computed } from "vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SettingSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
  groupLabel?: string;
}

const props = defineProps<{
  modelValue?: string;
  options: SettingSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  triggerClass?: string;
}>();

defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const groupedOptions = computed(() => {
  const groups = new Map<string, { label?: string; options: SettingSelectOption[] }>();

  for (const option of props.options) {
    const key = option.group ?? "";
    const group = groups.get(key) ?? { label: option.groupLabel, options: [] };
    group.options.push(option);
    groups.set(key, group);
  }

  return [...groups.entries()].map(([key, group]) => ({
    key,
    ...group,
  }));
});
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
      <SelectGroup v-for="group in groupedOptions" :key="group.key">
        <SelectLabel v-if="group.label">{{ group.label }}</SelectLabel>
        <SelectItem
          v-for="option in group.options"
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
