<template>
  <div class="flex flex-col items-center gap-2 space-x-4 sm:flex-row">
    <div class="flex flex-col gap-1">
      <div class="flex gap-1">
        <Label class="w-32 text-sm">
          {{ $t(props.labelKey) }}
        </Label>
        <BetaBadge v-if="props.beta" />
      </div>
      <p class="text-muted-foreground text-sm">
        {{ $t(props.descriptionKey) }}
      </p>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { Label } from "@/components/ui/label";
import BetaBadge from "./BetaBadge.vue";

interface Props {
  labelKey: string;
  descriptionKey: string;
  beta?: boolean;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
