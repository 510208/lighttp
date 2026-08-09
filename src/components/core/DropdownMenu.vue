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
        <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem @click="FileHelpers.loadWorkspaceFromFile()">
        <FolderOpen />
        {{ $t("title_bar.dropdown_menu.load") }}
        <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Info, EllipsisVertical, Save, FolderOpen, Bolt } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Window, FileHelpers } from "@/services";
import SettingPanel from "@/components/settings/SettingsPanel.vue";
import { ref, onMounted, onUnmounted } from "vue";
import hotkeys from "hotkeys-js";

const isSettingsOpen = ref(false);

function openSettings() {
  isSettingsOpen.value = true;
}

onMounted(() => {
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    FileHelpers.saveWorkspaceToFile();
  });

  hotkeys("ctrl+o", (event) => {
    event.preventDefault();
    FileHelpers.loadWorkspaceFromFile();
  });
});

onUnmounted(() => {
  hotkeys.unbind();
});
</script>

<style scoped></style>
