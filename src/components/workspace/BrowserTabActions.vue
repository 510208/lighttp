<script setup lang="ts">
import { Plus } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

defineEmits<{ create: [] }>();
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon-sm"
        class="text-lh-overlay-2 hover:bg-lh-mantle size-8 shrink-0 cursor-pointer rounded-lg p-1.5"
        :aria-label="$t('home.workspace.new_request')"
        @click="$emit('create')"
      >
        <Plus class="size-5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right">{{
      $t("home.workspace.new_request")
    }}</TooltipContent>
  </Tooltip>
</template>
