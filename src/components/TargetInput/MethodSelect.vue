<template>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select a method" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>選擇</SelectLabel>
        <SelectItem value="GET">GET</SelectItem>
        <SelectItem value="POST">POST</SelectItem>
        <SelectItem value="PUT">PUT</SelectItem>
        <SelectItem value="DELETE">DELETE</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
</script>

<style scoped></style>
