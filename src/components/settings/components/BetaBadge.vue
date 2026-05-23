<template>
  <Badge variant="default" v-if="props.type === 'experimental'">
    <FlaskConical /> Experimental
  </Badge>
  <Badge variant="secondary" v-else-if="props.type === 'beta'">
    <FlaskConical /> Beta
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "@lucide/vue";

interface Props {
  type?: "experimental" | "beta";
}

const props = withDefaults(defineProps<Props>(), {
  type: "experimental",
});
</script>
