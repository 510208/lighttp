<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-2 p-2 px-4">
      <span class="text-sm font-semibold">選擇語言</span>
      <!-- 選擇語言 -->
      <Select v-model="language" @update:model-value="changeLanguage">
        <SelectTrigger size="sm">
          <SelectValue placeholder="選擇語言" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="plaintext">Plain Text</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="html">HTML</SelectItem>
          <SelectItem value="xml">XML</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="h-40 border-t">
      <div id="editor" ref="editorContainer"></div>
    </div>
  </div>
</template>

<style scoped>
#editor {
  height: 100%;
  width: 100%;
}
</style>
