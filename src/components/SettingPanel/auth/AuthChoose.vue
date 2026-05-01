<template>
  <Select>
    <SelectTrigger size="sm">
      <SelectValue placeholder="選擇認證方式" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="method in authMethods"
        :key="method.value"
        :value="method.value"
        @select="handleSelect"
      >
        {{ method.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { authMethods } from "./methods";
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

// 2. 這裡接收到的會是正確的 string 值
function handleSelect(value: string) {
  emit("update:modelValue", value);
}
</script>

<style scoped></style>
