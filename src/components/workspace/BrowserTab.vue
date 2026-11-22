<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { AlertCircle, Globe, LoaderCircle, X } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExecutionStatus, WorkspaceTab } from "@/types/workspace";

const props = defineProps<{
  tab: WorkspaceTab;
  title: string;
  method: string;
  url: string;
  active: boolean;
  status: ExecutionStatus;
  dragging: boolean;
  dropPosition: "before" | "after" | null;
  position: number;
  total: number;
}>();
const emit = defineEmits<{
  activate: [];
  close: [];
  dragstart: [event: DragEvent];
  dragend: [];
  dragover: [event: DragEvent];
  drop: [event: DragEvent];
  navigate: [event: KeyboardEvent];
}>();
const { t } = useI18n();
const methodColor = computed(
  () =>
    (
      ({
        GET: "text-lh-green",
        POST: "text-lh-peach",
        PUT: "text-lh-teal",
        PATCH: "text-lh-yellow",
        DELETE: "text-lh-red",
        HEAD: "text-lh-blue",
        OPTIONS: "text-lh-mauve",
      }) as Record<string, string>
    )[props.method] ?? "text-lh-subtext-1",
);
const failedFavicon = ref("");
const faviconUrl = computed(() => {
  try {
    const url = new URL(props.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return new URL("/favicon.ico", url.origin).href;
  } catch {
    return "";
  }
});
</script>

<template>
  <div
    class="group relative size-8 shrink-0 rounded-lg"
    :class="{ 'opacity-40': dragging }"
    :data-tab-id="tab.id"
    @mousedown.middle.prevent
    @auxclick.middle.prevent="emit('close')"
    @dragover="emit('dragover', $event)"
    @drop="emit('drop', $event)"
  >
    <div
      v-if="dropPosition"
      class="bg-lh-green pointer-events-none absolute right-0 left-0 z-10 h-0.5 rounded-full"
      :class="dropPosition === 'before' ? '-top-0.5' : '-bottom-0.5'"
    />
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          :id="'workspace-tab-' + tab.id"
          variant="ghost"
          size="icon-sm"
          role="tab"
          :title="method + ' ' + title"
          :aria-label="method + ' ' + title"
          :aria-selected="active"
          :aria-controls="'workspace-panel-' + tab.id"
          :aria-posinset="position"
          :aria-setsize="total"
          :tabindex="active ? 0 : -1"
          :draggable="true"
          class="hover:bg-lh-mantle text-lh-text size-8 cursor-pointer rounded-lg p-1.5"
          :class="{ 'bg-lh-mantle': active }"
          @click="emit('activate')"
          @keydown="emit('navigate', $event)"
          @dragstart="emit('dragstart', $event)"
          @dragend="emit('dragend')"
        >
          <LoaderCircle
            v-if="status === 'pending'"
            class="text-lh-green size-5 animate-spin"
          />
          <AlertCircle
            v-else-if="status === 'error'"
            class="text-lh-red size-5"
          />
          <img
            v-else-if="faviconUrl && failedFavicon !== faviconUrl"
            :key="faviconUrl"
            :src="faviconUrl"
            alt=""
            referrerpolicy="no-referrer"
            class="pointer-events-none size-5 rounded-sm object-contain"
            @error="failedFavicon = faviconUrl"
          />
          <span
            v-else-if="method && method !== 'NONE'"
            class="font-space flex size-5 items-center justify-center text-[8px] font-bold tracking-tighter"
            :class="methodColor"
            >{{ method }}</span
          >
          <Globe v-else class="text-lh-subtext-1 size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        class="bg-lh-mantle text-lh-text border-lh-surface-1 max-w-80 border"
      >
        <div class="flex items-center gap-2">
          <span class="font-space font-bold" :class="methodColor">{{
            method
          }}</span>
          <span class="truncate">{{ title }}</span>
        </div>
        <p
          v-if="status === 'pending' || status === 'error'"
          class="text-lh-subtext-0 mt-1"
        >
          {{ t("home.workspace.status." + status) }}
        </p>
      </TooltipContent>
    </Tooltip>
    <button
      type="button"
      :aria-label="t('home.workspace.close_named', { title })"
      :title="t('home.workspace.close_tab')"
      :draggable="false"
      class="bg-lh-surface-1 text-lh-subtext-1 hover:bg-lh-red hover:text-lh-crust focus-visible:ring-lh-green absolute -top-0.5 -right-0.5 z-10 flex size-3.5 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity outline-none group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1"
      @mousedown.stop
      @dragstart.prevent.stop
      @click.stop="emit('close')"
    >
      <X class="size-2.5" />
    </button>
  </div>
</template>
