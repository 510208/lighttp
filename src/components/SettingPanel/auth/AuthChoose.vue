<template>
  <!-- 關鍵：綁定 :model-value 為 props 傳進來的值 -->
  <Select
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as string)"
  >
    <SelectTrigger size="sm">
      <SelectValue :placeholder="placeholder || '選擇認證方式'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="method in authMethods"
        :key="method.value"
        :value="method.value"
      >
        {{ method.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { authMethods } from "@/constants/methods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 接收父組件傳入的 v-model
defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>
