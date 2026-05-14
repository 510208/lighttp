<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="Window.openAboutWindow()">
        <Info />
        關於 LigHTTP
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="FileHelpers.saveWorkspaceToFile()">
        儲存當前工作
      </DropdownMenuItem>
      <DropdownMenuItem @click="FileHelpers.loadWorkspaceFromFile()">
        載入工作
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
import { Info, EllipsisVertical } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Window, FileHelpers } from "@/services";
</script>

<style scoped></style>
