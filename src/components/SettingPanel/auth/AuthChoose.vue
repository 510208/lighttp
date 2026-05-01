<template>
  <Select>
    <SelectTrigger>
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
import { authMethods } from "./methods";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
</script>

<style scoped></style>
