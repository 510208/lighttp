<template>
  <section
    class="lh-setting-option"
    :aria-labelledby="labelId"
    :aria-describedby="descriptionId"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <h3 :id="labelId" class="lh-setting-label">
          {{ $t(props.labelKey) }}
        </h3>
        <BetaBadge v-if="props.beta" />
      </div>
      <p :id="descriptionId" class="lh-setting-description">
        {{ $t(props.descriptionKey) }}
      </p>
    </div>

    <div class="lh-setting-control">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from "vue";
import BetaBadge from "./BetaBadge.vue";

interface Props {
  labelKey: string;
  descriptionKey: string;
  beta?: boolean;
}

const props = defineProps<Props>();
const id = useId();
const labelId = `setting-label-${id}`;
const descriptionId = `setting-description-${id}`;
</script>
