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

      <DropdownMenuItem @click="cookieStore.managerOpen = true">
        <Cookie />
        {{ $t("cookies.manager") }}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="Window.openAboutWindow()">
        <Info />
        {{ $t("title_bar.dropdown_menu.about") }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <SettingPanel v-model:open="isSettingsOpen" />
  <Dialog v-model:open="aboutOpen">
    <DialogContent
      class="bg-lh-base border-lh-surface-1 max-h-[90vh] max-w-2xl overflow-y-auto p-0"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{{ $t("title_bar.dropdown_menu.about") }}</DialogTitle>
        <DialogDescription>LigHTTP</DialogDescription>
      </DialogHeader>
      <About embedded @close="aboutOpen = false" />
    </DialogContent>
  </Dialog>
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
import {
  Info,
  EllipsisVertical,
  Save,
  FolderOpen,
  Bolt,
  Cookie,
} from "@lucide/vue";
import { useCookieStore } from "@/stores/useCookieStore";
import { Button } from "@/components/ui/button";
import { Window, FileHelpers } from "@/services";
import SettingPanel from "@/components/settings/SettingsPanel.vue";
import { ref } from "vue";
import About from "@/pages/About.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const isSettingsOpen = ref(false);
const cookieStore = useCookieStore();
const { aboutOpen } = Window;

function openSettings() {
  isSettingsOpen.value = true;
}
</script>

<style scoped></style>
