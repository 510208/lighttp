<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="FileHelpers.saveWorkspaceToFile()">
        <Save />
        儲存當前工作
      </DropdownMenuItem>
      <DropdownMenuItem @click="FileHelpers.loadWorkspaceFromFile()">
        <FolderOpen />
        載入工作
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="Window.openAboutWindow()">
        <Info />
        關於 LigHTTP
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Info, EllipsisVertical, Save, FolderOpen } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Window, FileHelpers } from "@/services";
</script>

<style scoped></style>
