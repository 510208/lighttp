<script setup lang="ts">
import SettingRow from "./SettingRow.vue";
import BetaBadge from "./BetaBadge.vue";

interface Props {
  labelKey: string;
  descriptionKey: string;
  beta?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <SettingRow
    :title="$t(props.labelKey)"
    :description="$t(props.descriptionKey)"
  >
    <template #badge>
      <BetaBadge v-if="props.beta" />
    </template>
    <slot />
  </SettingRow>
</template>
