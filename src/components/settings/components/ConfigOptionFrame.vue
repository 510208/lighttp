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
    <template #default>
      <div class="flex items-center gap-2">
        <BetaBadge v-if="props.beta" />
        <slot />
      </div>
    </template>
  </SettingRow>
</template>
