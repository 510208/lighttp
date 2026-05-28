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
        {{ $t("title_bar.dropdown_menu.save") }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="FileHelpers.loadWorkspaceFromFile()">
        <FolderOpen />
        {{ $t("title_bar.dropdown_menu.load") }}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="openSettings()">
        <Bolt />
        {{ $t("title_bar.dropdown_menu.settings") }}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="Window.openAboutWindow()">
        <Info />
        {{ $t("title_bar.dropdown_menu.about") }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <SettingPanel v-model:open="isSettingsOpen" />
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Info, EllipsisVertical, Save, FolderOpen, Bolt } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Window, FileHelpers } from "@/services";
import SettingPanel from "@/components/settings/SettingsPanel.vue";
import { ref } from "vue";

const isSettingsOpen = ref(false);

function openSettings() {
  isSettingsOpen.value = true;
}
</script>

<style scoped></style>
