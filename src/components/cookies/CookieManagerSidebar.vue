<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Globe, Search } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

defineProps<{
  domains: string[];
  search: string;
  selectedDomain: string | null;
}>();
const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "update:selectedDomain", value: string | null): void;
}>();
const { t } = useI18n();
</script>

<template>
  <aside
    class="lh-settings-sidebar w-44 shrink-0 sm:w-[200px]"
    :aria-label="t('cookies.sites')"
  >
    <DialogHeader class="lh-settings-heading">
      <DialogTitle class="lh-settings-title">{{
        t("cookies.manager")
      }}</DialogTitle>
      <DialogDescription class="lh-settings-version">
        {{ t("cookies.subtitle") }}
      </DialogDescription>
    </DialogHeader>
    <div class="lh-settings-search min-w-0 px-2 sm:px-3">
      <Search class="size-4 shrink-0" aria-hidden="true" />
      <Input
        :model-value="search"
        :placeholder="t('cookies.search')"
        :aria-label="t('cookies.search')"
        class="w-auto border-none !bg-transparent p-0 hover:ring-0"
        @update:model-value="emit('update:search', String($event))"
      />
    </div>
    <Label class="text-lh-subtext-0 px-2 text-xs">{{
      t("cookies.sites")
    }}</Label>
    <nav class="flex min-h-0 flex-col gap-1" :aria-label="t('cookies.sites')">
      <Button
        variant="ghost"
        class="sh-settings-tab"
        :data-state="selectedDomain === null ? 'active' : 'inactive'"
        :aria-pressed="selectedDomain === null"
        @click="emit('update:selectedDomain', null)"
      >
        <Globe class="size-4 shrink-0" />
        <span class="truncate">{{ t("cookies.all_sites") }}</span>
      </Button>
      <Button
        v-for="domain in domains"
        :key="domain"
        variant="ghost"
        class="sh-settings-tab"
        :data-state="selectedDomain === domain ? 'active' : 'inactive'"
        :aria-pressed="selectedDomain === domain"
        :title="domain"
        @click="emit('update:selectedDomain', domain)"
      >
        <Globe class="size-4 shrink-0" />
        <span class="min-w-0 truncate">{{ domain }}</span>
      </Button>
    </nav>
  </aside>
</template>
