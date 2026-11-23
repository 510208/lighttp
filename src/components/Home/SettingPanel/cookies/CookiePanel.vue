<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Cookie } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRequestStore } from "@/stores/useRequestStore";
import { useCookieStore } from "@/stores/useCookieStore";
import { listCookies } from "@/services/cookies";
import type { ManagedCookie } from "@/types/cookies";

const request = useRequestStore();
const store = useCookieStore();
const { t } = useI18n();
const cookies = ref<ManagedCookie[]>([]);
const loading = ref(false);
const error = ref("");
const selectedCount = computed(
  () =>
    cookies.value.filter(
      (cookie) => cookie.matchesUrl && request.cookieIds.includes(cookie.id),
    ).length,
);
const missingIds = computed(() =>
  request.cookieIds.filter(
    (id) => !cookies.value.some((cookie) => cookie.id === id),
  ),
);
const manualHeader = computed(() =>
  request.headers.some(
    (header) => header.enabled && header.key.toLowerCase() === "cookie",
  ),
);

watch(
  () => [request.url, store.revision],
  (_value, _previous, onCleanup) => {
    let cancelled = false;
    loading.value = true;
    const timer = setTimeout(async () => {
      try {
        const value = request.url.trim();
        const lower = value.toLowerCase();
        const url =
          lower.startsWith("https://") || lower.startsWith("http://")
            ? value
            : `http://${value}`;
        const result = await listCookies(url);
        if (cancelled) return;
        cookies.value = result.sort(
          (left, right) => Number(right.matchesUrl) - Number(left.matchesUrl),
        );
        error.value = "";
      } catch (cause) {
        if (!cancelled) {
          cookies.value = [];
          error.value = String(cause);
        }
      } finally {
        if (!cancelled) loading.value = false;
      }
    }, 150);
    onCleanup(() => {
      cancelled = true;
      clearTimeout(timer);
    });
  },
  { immediate: true },
);

function toggle(id: string, enabled: boolean | "indeterminate") {
  request.cookieIds =
    enabled === true
      ? [...new Set([...request.cookieIds, id])]
      : request.cookieIds.filter((value) => value !== id);
}

function removeMissing() {
  request.cookieIds = request.cookieIds.filter(
    (id) => !missingIds.value.includes(id),
  );
}
</script>

<template>
  <div class="flex flex-col gap-3" :aria-busy="loading">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-lh-subtext-0 text-sm">
        {{ t("cookies.selected", { count: selectedCount }) }}
      </p>
      <Button variant="outline" size="sm" @click="store.managerOpen = true"
        ><Cookie />{{ t("cookies.manager") }}</Button
      >
    </div>
    <p class="text-lh-subtext-0 text-xs">{{ t("cookies.request_hint") }}</p>
    <p
      v-if="manualHeader && request.cookieIds.length"
      role="alert"
      class="text-lh-yellow text-xs"
    >
      {{ t("cookies.header_conflict") }}
    </p>
    <p v-if="error" role="alert" class="text-lh-red text-sm">{{ error }}</p>
    <p
      v-else-if="!loading && !cookies.length"
      class="text-lh-subtext-0 py-4 text-sm"
    >
      {{ t("cookies.empty") }}
    </p>
    <div
      v-if="!loading && !error && missingIds.length"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-lh-subtext-0 text-xs">
        {{ t("cookies.missing", { count: missingIds.length }) }}
      </p>
      <Button variant="ghost" size="sm" @click="removeMissing">{{
        t("cookies.remove_missing")
      }}</Button>
    </div>
    <label
      v-for="cookie in cookies"
      :key="cookie.id"
      class="border-lh-surface-1 flex items-center gap-3 rounded-md border p-3"
      :class="{ 'opacity-50': !cookie.matchesUrl }"
    >
      <Checkbox
        :model-value="request.cookieIds.includes(cookie.id)"
        :disabled="
          loading ||
          (!cookie.matchesUrl && !request.cookieIds.includes(cookie.id))
        "
        @update:model-value="toggle(cookie.id, $event)"
      />
      <span class="min-w-0 flex-1">
        <span class="block truncate font-mono text-sm">{{ cookie.name }}</span>
        <span class="text-lh-subtext-0 block truncate text-xs"
          >{{ cookie.domain }}{{ cookie.path }}</span
        >
        <span v-if="!cookie.matchesUrl" class="text-lh-subtext-0 text-xs">{{
          t("cookies.not_matching")
        }}</span>
      </span>
      <span class="text-lh-subtext-0 text-xs">{{
        cookie.persistent ? t("cookies.persistent") : t("cookies.memory_only")
      }}</span>
    </label>
  </div>
</template>
