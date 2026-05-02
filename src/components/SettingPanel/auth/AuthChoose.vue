<template>
  <Select @update:model-value="(v) => emit('update:modelValue', v)">
    <SelectTrigger size="sm">
      <SelectValue placeholder="選擇認證方式" />
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
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped></style>
